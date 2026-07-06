"""Cross-user authorization: user B must never see or mutate user A's resources.

Every check expects 404 (not 403) so resource IDs can't be enumerated.
"""
import pytest

from app.core.security import create_access_token


@pytest.fixture
def other_auth_headers(client):
    client.post("/api/auth/register", json={
        "name": "Other User",
        "email": "other@example.com",
        "password": "otherpass123",
    })
    res = client.post("/api/auth/login", json={
        "email": "other@example.com",
        "password": "otherpass123",
    })
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


@pytest.fixture
def owned_resources(client, auth_headers):
    """A project, task, and task comment owned by the primary test user."""
    project = client.post(
        "/api/projects", json={"title": "Owned Project", "status": "idea"}, headers=auth_headers
    ).json()
    task = client.post(
        f"/api/projects/{project['id']}/tasks", json={"title": "Owned task"}, headers=auth_headers
    ).json()
    comment = client.post(
        f"/api/tasks/{task['id']}/comments", json={"content": "Owner comment"}, headers=auth_headers
    ).json()
    return {"project": project, "task": task, "comment": comment}


def test_cannot_read_another_users_project(client, other_auth_headers, owned_resources):
    res = client.get(f"/api/projects/{owned_resources['project']['id']}", headers=other_auth_headers)
    assert res.status_code == 404


def test_cannot_update_another_users_project(client, other_auth_headers, owned_resources):
    res = client.patch(
        f"/api/projects/{owned_resources['project']['id']}",
        json={"title": "Hijacked"},
        headers=other_auth_headers,
    )
    assert res.status_code == 404


def test_cannot_delete_another_users_project(client, other_auth_headers, owned_resources):
    res = client.delete(f"/api/projects/{owned_resources['project']['id']}", headers=other_auth_headers)
    assert res.status_code == 404


def test_another_users_project_not_in_list(client, other_auth_headers, owned_resources):
    res = client.get("/api/projects", headers=other_auth_headers)
    assert res.status_code == 200
    assert res.json() == []


def test_cannot_list_tasks_of_another_users_project(client, other_auth_headers, owned_resources):
    res = client.get(f"/api/projects/{owned_resources['project']['id']}/tasks", headers=other_auth_headers)
    assert res.status_code == 404


def test_cannot_create_task_in_another_users_project(client, other_auth_headers, owned_resources):
    res = client.post(
        f"/api/projects/{owned_resources['project']['id']}/tasks",
        json={"title": "Injected task"},
        headers=other_auth_headers,
    )
    assert res.status_code == 404


def test_cannot_update_another_users_task(client, other_auth_headers, owned_resources):
    res = client.patch(
        f"/api/tasks/{owned_resources['task']['id']}", json={"is_done": True}, headers=other_auth_headers
    )
    assert res.status_code == 404


def test_cannot_delete_another_users_task(client, other_auth_headers, owned_resources):
    res = client.delete(f"/api/tasks/{owned_resources['task']['id']}", headers=other_auth_headers)
    assert res.status_code == 404


def test_cannot_read_comments_of_another_users_task(client, other_auth_headers, owned_resources):
    res = client.get(f"/api/tasks/{owned_resources['task']['id']}/comments", headers=other_auth_headers)
    assert res.status_code == 404


def test_cannot_comment_on_another_users_task(client, other_auth_headers, owned_resources):
    res = client.post(
        f"/api/tasks/{owned_resources['task']['id']}/comments",
        json={"content": "Drive-by comment"},
        headers=other_auth_headers,
    )
    assert res.status_code == 404


def test_cannot_delete_another_users_comment(client, other_auth_headers, owned_resources):
    res = client.delete(f"/api/comments/{owned_resources['comment']['id']}", headers=other_auth_headers)
    assert res.status_code == 404


def test_cannot_access_another_users_project_comments(client, other_auth_headers, owned_resources):
    project_id = owned_resources["project"]["id"]
    assert client.get(f"/api/projects/{project_id}/comments", headers=other_auth_headers).status_code == 404
    assert client.post(
        f"/api/projects/{project_id}/comments", json={"content": "Nope"}, headers=other_auth_headers
    ).status_code == 404
    assert client.get(f"/api/projects/{project_id}/activity", headers=other_auth_headers).status_code == 404


def test_cannot_access_another_users_learning_notes(client, other_auth_headers, owned_resources):
    project_id = owned_resources["project"]["id"]
    assert client.get(
        f"/api/projects/{project_id}/learning-notes", headers=other_auth_headers
    ).status_code == 404
    assert client.post(
        f"/api/projects/{project_id}/learning-notes",
        json={"title": "Note", "content": "Content"},
        headers=other_auth_headers,
    ).status_code == 404


def test_owner_still_has_access(client, auth_headers, owned_resources):
    res = client.get(f"/api/projects/{owned_resources['project']['id']}", headers=auth_headers)
    assert res.status_code == 200


def test_garbage_token_rejected(client):
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert res.status_code == 401


def test_valid_token_with_malformed_sub_rejected(client):
    token = create_access_token({"sub": "not-a-uuid"})
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 401
