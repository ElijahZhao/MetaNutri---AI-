import json, time, urllib.request, urllib.error

BASE = "https://metanutri-backend.onrender.com"
TS = int(time.time())
USER = f"e2e_{TS}"
EMAIL = f"{USER}@example.com"
P1 = "Alpha1234!"
P2 = "Bravo5678!"
P3 = "Chrome9012!"

def req(method, path, body=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=45) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw
    except Exception as e:
        return -1, str(e)

def check(label, cond, extra=""):
    print(("PASS" if cond else "FAIL"), "|", label, extra)

print("USER:", USER, "EMAIL:", EMAIL)

code, d = req("POST", "/api/auth/register", {"email": EMAIL, "username": USER, "password": P1})
check("register=201", code == 201, f"({code})")

code, d = req("POST", "/api/auth/login", {"username": USER, "password": P1})
check("login(P1)=200", code == 200, f"({code})")
tok1 = d.get("access_token", "") if code == 200 else ""

code, d = req("POST", "/api/users/change-password", {"old_password": P1, "new_password": P2}, token=tok1)
check("change-password=200", code == 200, f"({code}) {d}")

code, d = req("GET", "/api/users/me", token=tok1)
check("old-token revoked=401", code == 401, f"({code})")

code, d = req("POST", "/api/auth/login", {"username": USER, "password": P2})
check("login(P2)=200", code == 200, f"({code})")
tok2 = d.get("access_token", "") if code == 200 else ""

code, d = req("POST", "/api/users/change-password", {"old_password": "WRONG", "new_password": P2}, token=tok1)
check("wrong-old=400", code == 400, f"({code})")

code, d = req("POST", "/api/auth/forgot-password", {"email": EMAIL})
rtoken = d.get("reset_token", "") if code == 200 else ""
check("forgot-password=200 & token", code == 200 and bool(rtoken), f"({code}) token_len={len(rtoken)}")

code, d = req("POST", "/api/auth/reset-password", {"token": rtoken, "new_password": P3})
check("reset-password=200", code == 200, f"({code}) {d}")

code, d = req("POST", "/api/auth/reset-password", {"token": rtoken, "new_password": "Another9999!"})
check("reset-token-reuse=400", code == 400, f"({code})")

code, d = req("POST", "/api/auth/login", {"username": USER, "password": P3})
check("login(P3)=200", code == 200, f"({code})")

code, d = req("POST", "/api/auth/login", {"username": USER, "password": P2})
check("login(P2)-after-reset=400", code == 400, f"({code})")

print("TESTED_ACCOUNT", json.dumps({"username": USER, "email": EMAIL}))