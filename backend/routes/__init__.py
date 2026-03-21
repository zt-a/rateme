from routes.auth import router as auth_router
from routes.user import router as user_router
from routes.person import router as person_router
from routes.admin import router as admin_router
from routes.person_photo import router as person_photo_router
from routes.report import router as report_router
from routes.moderator import router as moderator_router

routers = [
    auth_router,
     user_router,
      person_router,
       admin_router,
        person_photo_router,
         report_router,
          moderator_router
    ]