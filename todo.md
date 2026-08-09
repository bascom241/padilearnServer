## Test uploading of course, module, lesson , video and complete the backedn and frontend flow

## Full course upload flow (server API)

Auth: must be signed in as `instructor` or `admin` for all write steps below.

1. **Upload thumbnail elsewhere** — `POST /courses` requires `thumbnail` to already be a valid URL; this endpoint does not accept a file upload itself.

2. **Create the course**
   `POST /api/v1/courses`
   Body: `title` (>=3 chars), `description` (>=10 chars), `thumbnail` (URL), `category`, `price` (>=0), `level` (optional, default `beginner`)
   Created with `status: DRAFT`, `isPublished: false`.

3. **Add modules**
   `POST /api/v1/courses/:courseId/modules`
   Body: `title` (>=3 chars), `description` (>=5 chars)

4. **Add lessons to each module**
   `POST /api/v1/modules/:moduleId/lessons`
   Body: `title`, `description`, `isPreview` (optional)
   Max 5 lessons per module ([lesson.service.ts](server/src/modules/courses/lesson/lesson.service.ts) `MAX_LESSONS_PER_MODULE`).

5. **Upload video for each lesson** (2-step, direct-to-Bunny)
   - `POST /api/v1/lessons/:lessonId/video` with `{ title }` — creates a Bunny Stream video entry + a `Video` doc (`status: UPLOADING`), returns TUS upload credentials (`videoId`, `libraryId`, `uploadEndpoint`, `signature`, `expirationTime`).
   - Client uploads the video file directly to Bunny via TUS using those credentials (not through this server).
   - Bunny calls back `POST /api/v1/videos/webhook?secret=...` when encoding finishes; server sets `status: READY`, `duration`, `thumbnailUrl`, and recomputes module duration.
   - Requires `BUNNY_STREAM_WEBHOOK_SECRET` + Bunny library credentials configured server-side (`config/bunny.js`).

6. **Submit for review**
   `POST /api/v1/courses/:courseId/submit-for-review` — owner/admin only, valid from `DRAFT` or `REJECTED` -> `PENDING`.

7. **Admin approves or rejects**
   - `POST /api/v1/courses/:courseId/approve` — admin only, `PENDING` -> `PUBLISHED`, sets `isPublished: true`. **This is the only step that makes the course live.**
   - `POST /api/v1/courses/:courseId/reject` — admin only, with optional `reason`, sets back to `REJECTED`.

### Checklist
- [ ] Sign in as instructor/admin
- [ ] Upload thumbnail elsewhere, get URL
- [ ] `POST /courses`
- [ ] `POST /courses/:id/modules` per module
- [ ] `POST /modules/:id/lessons` per lesson (max 5/module)
- [ ] `POST /lessons/:id/video` -> upload to Bunny via TUS -> confirm webhook flips status to `READY`
- [ ] `POST /courses/:id/submit-for-review`
- [ ] Admin: `POST /courses/:id/approve`
