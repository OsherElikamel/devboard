def _create_project_with_tasks(client, headers, title, task_titles):
    project = client.post("/api/projects", json={"title": title, "status": "idea"}, headers=headers).json()
    for task_title in task_titles:
        client.post(f"/api/projects/{project['id']}/tasks", json={"title": task_title}, headers=headers)
    return project


def test_list_all_tasks_spans_projects(client, auth_headers):
    _create_project_with_tasks(client, auth_headers, "Project A", ["A1", "A2"])
    _create_project_with_tasks(client, auth_headers, "Project B", ["B1"])

    res = client.get("/api/tasks", headers=auth_headers)
    assert res.status_code == 200
    titles = {t["title"] for t in res.json()}
    assert titles == {"A1", "A2", "B1"}


def test_list_all_tasks_scoped_to_user(client, auth_headers):
    _create_project_with_tasks(client, auth_headers, "Mine", ["My task"])

    client.post("/api/auth/register", json={
        "name": "Other User",
        "email": "other-tasks@example.com",
        "password": "otherpass123",
    })
    login = client.post("/api/auth/login", json={
        "email": "other-tasks@example.com",
        "password": "otherpass123",
    })
    other_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    res = client.get("/api/tasks", headers=other_headers)
    assert res.status_code == 200
    assert res.json() == []


def test_list_all_tasks_excludes_soft_deleted_projects(client, auth_headers):
    project = _create_project_with_tasks(client, auth_headers, "Doomed", ["Task"])
    client.delete(f"/api/projects/{project['id']}", headers=auth_headers)

    res = client.get("/api/tasks", headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == []
