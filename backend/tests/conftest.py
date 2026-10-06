"""Test bootstrap.

Set the environment *before* ``app.core.config`` is imported, so the test run
never picks up a real ``.env`` and never trips the production SECRET_KEY guard.
"""

import os

os.environ["SECRET_KEY"] = "test-secret-key-not-for-production"
os.environ["RATE_LIMIT_ENABLED"] = "false"
os.environ["ALLOW_DEFAULT_SECRET_KEY"] = "1"
