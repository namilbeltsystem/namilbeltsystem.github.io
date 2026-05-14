#!/usr/bin/env python3
"""티스토리 블로그 자동 포스팅"""

import json, os, sys, requests

CONFIG_FILE = "blog/config.json"

def load_config():
    with open(CONFIG_FILE, encoding='utf-8') as f:
        return json.load(f)

def post_to_tistory(title, content, tags=None, visibility="3"):
    """Post to Tistory blog via API"""
    config = load_config()
    access_token = config["tistory"]["access_token"]

    if access_token == "YOUR_TISTORY_ACCESS_TOKEN":
        print("ERROR: Tistory access token not configured.")
        print("1. Visit https://www.tistory.com/guide/api/manage/register")
        print("2. Register an app (App name: 남일벨트시스템 블로그)")
        print("3. Get Client ID and Secret Key")
        print("4. Visit: https://www.tistory.com/oauth/authorize?client_id=YOUR_ID&redirect_uri=https://namilbeltsystem.github.io&response_type=token")
        print("5. Copy the access_token from the redirect URL")
        print("6. Update blog/config.json with the access_token")
        return None

    blog_url = config["tistory"]["blog_url"].rstrip('/')
    blog_name = blog_url.replace("https://", "").replace(".tistory.com", "")

    # Correct Tistory API endpoint
    url = "https://www.tistory.com/apis/post/write"

    data = {
        "access_token": access_token,
        "output": "json",
        "blogName": blog_name,
        "title": title,
        "content": content,
        "visibility": visibility,
    }

    if tags:
        data["tag"] = ",".join(tags)

    try:
        resp = requests.post(url, data=data, timeout=30)
        result = resp.json()
        if result.get("tistory", {}).get("status") == "200":
            post_id = result["tistory"]["postId"]
            post_url = f"{blog_url}/{post_id}"
            print(f"Posted: {title}")
            print(f"URL: {post_url}")
            return post_url
        else:
            print(f"Error: {result.get('tistory', {}).get('error_message', resp.text)}")
            return None
    except Exception as e:
        print(f"Exception: {e}")
        return None

def post_drafts():
    """Post all generated drafts"""
    posts_dir = "blog/posts"
    if not os.path.exists(posts_dir):
        print("No drafts to post")
        return

    posted = []
    for f in sorted(os.listdir(posts_dir)):
        if not f.endswith('.json'):
            continue
        path = os.path.join(posts_dir, f)
        with open(path, encoding='utf-8') as fp:
            post = json.load(fp)

        url = post_to_tistory(post["title"], post["content"], post.get("tags"))
        if url:
            posted.append((f, url))
        else:
            print(f"Failed: {post['title']}")
            break  # Stop on first failure to avoid partial posting

    # Move posted files to archive
    for f, _ in posted:
        os.rename(f"blog/posts/{f}", f"blog/archive/{f}")

    print(f"\nPosted {len(posted)} drafts")

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "post"

    if action == "post":
        post_drafts()
    elif action == "test":
        test_post = {
            "title": "[테스트] 남일벨트시스템 티스토리 연동 확인",
            "content": "<p>티스토리 API 연동 테스트 글입니다.</p><p>정상 작동 확인 후 자동 삭제됩니다.</p>"
        }
        post_to_tistory(test_post["title"], test_post["content"], tags=["테스트"])
