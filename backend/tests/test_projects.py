def test_create_project(client, auth_headers):
    res = client.post("/api/projects", json={
        "title": "Test Project",
        "status": "idea",
    }, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Test Project"
    assert data["status"] == "idea"
    assert data["deployment_status"] == "not_deployed"


def test_create_project_unauthenticated(client):
    res = client.post("/api/projects", json={"title": "Test", "status": "idea"})
    assert res.status_code == 401


def test_list_projects(client, auth_headers):
    client.post("/api/projects", json={"title": "Project A", "status": "idea"}, headers=auth_headers)
    client.post("/api/projects", json={"title": "Project B", "status": "in_progress"}, headers=auth_headers)
    res = client.get("/api/projects", headers=auth_headers)
    assert res.status_code == 200
    assert len(res.json()) == 2


def test_get_project(client, auth_headers):
    create_res = client.post("/api/projects", json={
        "title": "My Project",
        "description": "A test project",
        "status": "idea",
    }, headers=auth_headers)
    project_id = create_res.json()["id"]

    res = client.get(f"/api/projects/{project_id}", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "My Project"
    assert data["description"] == "A test project"


def test_update_project(client, auth_headers):
    create_res = client.post("/api/projects", json={"title": "Old Title", "status": "idea"}, headers=auth_headers)
    project_id = create_res.json()["id"]

    res = client.patch(f"/api/projects/{project_id}", json={
        "title": "New Title",
        "status": "in_progress",
    }, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["title"] == "New Title"
    assert res.json()["status"] == "in_progress"


def test_create_project_rejects_non_http_url(client, auth_headers):
    res = client.post("/api/projects", json={
        "title": "XSS Project",
        "status": "idea",
        "github_url": "javascript:alert(1)",
    }, headers=auth_headers)
    assert res.status_code == 422


def test_delete_project(client, auth_headers):
    create_res = client.post("/api/projects", json={"title": "To Delete", "status": "idea"}, headers=auth_headers)
    project_id = create_res.json()["id"]

    res = client.delete(f"/api/projects/{project_id}", headers=auth_headers)
    assert res.status_code == 204

    list_res = client.get("/api/projects", headers=auth_headers)
    assert len(list_res.json()) == 0
