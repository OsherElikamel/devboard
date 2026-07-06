def test_demo_endpoints_are_public(client):
    projects = client.get("/api/demo/projects")
    assert projects.status_code == 200
    project_id = projects.json()[0]["id"]

    for path in (
        "/api/demo/dashboard",
        f"/api/demo/projects/{project_id}",
        f"/api/demo/projects/{project_id}/tasks",
        f"/api/demo/projects/{project_id}/activity",
        f"/api/demo/projects/{project_id}/learning-notes",
    ):
        assert client.get(path).status_code == 200, path


def test_demo_learning_notes_shape(client):
    projects = client.get("/api/demo/projects").json()
    notes = client.get(f"/api/demo/projects/{projects[0]['id']}/learning-notes").json()
    assert len(notes) > 0
    assert {"id", "project_id", "title", "content", "topic", "created_at", "updated_at"} <= set(notes[0])


def test_demo_learning_notes_unknown_project(client):
    res = client.get("/api/demo/projects/00000000-0000-0000-0000-000000000000/learning-notes")
    assert res.status_code == 404
