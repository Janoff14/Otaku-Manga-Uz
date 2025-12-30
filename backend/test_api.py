"""
Test script for all API endpoints.
Run this after starting the server with: uvicorn app.main:app --port 8000
"""
import requests

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(method, url, **kwargs):
    try:
        resp = getattr(requests, method)(f"{BASE_URL}{url}", **kwargs)
        print(f"✅ {method.upper()} {url} -> {resp.status_code}")
        print(f"   Response: {resp.json()}\n")
        return resp.json()
    except Exception as e:
        print(f"❌ {method.upper()} {url} -> ERROR: {e}\n")
        return None

print("=" * 60)
print("OTAKU MANGA API - ENDPOINT TESTS")
print("=" * 60)

# 1. Health checks
print("\n--- Health Checks ---")
test_endpoint("get", "/health")
test_endpoint("get", "/db-health")

# 2. Manga list with pagination
print("\n--- Manga List & Search ---")
test_endpoint("get", "/api/v1/manga/")
test_endpoint("get", "/api/v1/manga/?search=demo")
test_endpoint("get", "/api/v1/manga/?page=1&page_size=5")

# 3. Manga detail
print("\n--- Manga Detail ---")
test_endpoint("get", "/api/v1/manga/demo-manga")

# 4. Manga like
print("\n--- Manga Like ---")
test_endpoint("post", "/api/v1/manga/demo-manga/like")

# 5. Manga comments
print("\n--- Manga Comments ---")
test_endpoint("post", "/api/v1/manga/demo-manga/comments", json={"user_name": "Tester", "text": "Great manga!"})
test_endpoint("get", "/api/v1/manga/demo-manga/comments")

# 6. Chapter detail (with pages)
print("\n--- Chapter Detail ---")
test_endpoint("get", "/api/v1/chapters/1")

# 7. Chapter like
print("\n--- Chapter Like ---")
test_endpoint("post", "/api/v1/chapters/1/like")

# 8. Chapter navigation
print("\n--- Chapter Navigation ---")
test_endpoint("get", "/api/v1/chapters/1/next")
test_endpoint("get", "/api/v1/chapters/1/prev")
test_endpoint("get", "/api/v1/chapters/2/next")  # Should be null (last chapter)
test_endpoint("get", "/api/v1/chapters/2/prev")

# 9. Chapter comments
print("\n--- Chapter Comments ---")
test_endpoint("post", "/api/v1/chapters/1/comments", json={"user_name": "Reader1", "text": "Nice chapter!"})
test_endpoint("get", "/api/v1/chapters/1/comments")

# 10. Reading progress
print("\n--- Reading Progress ---")
headers = {"X-User-Token": "test-user-123"}
test_endpoint("post", "/api/v1/progress/", json={"manga_id": 1, "chapter_id": 1, "page_index": 3}, headers=headers)
test_endpoint("get", "/api/v1/progress/1", headers=headers)

# Update progress
test_endpoint("post", "/api/v1/progress/", json={"manga_id": 1, "chapter_id": 2, "page_index": 1}, headers=headers)
test_endpoint("get", "/api/v1/progress/1", headers=headers)

print("\n" + "=" * 60)
print("ALL TESTS COMPLETE!")
print("=" * 60)

