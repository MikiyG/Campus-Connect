// ===========================================
// Campus Connect – Multi-Campus Network
// MongoDB Full Schema
// ===========================================
use campus_connect;
// ===========================================
// 1. universities
// ===========================================
db.createCollection("universities");
db.universities.createIndex({ code: 1 }, { unique: true });
/*
{
  name,
  code,
  country,
  created_at
}
*/
// ===========================================
// 2. users
// ===========================================
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["full_name", "email", "password", "role", "status"],
      properties: {
        full_name: { bsonType: "string" },
        email: {
          bsonType: "string",
          pattern: "^.+@.+\\..+$"
        },
        password: { bsonType: "string" },
        role: {
          enum: ["student", "university_admin", "super_admin"]
        },
        status: {
          enum: ["pending", "approved", "rejected"]
        },
        university_id: { bsonType: ["objectId", "null"] },
        managed_university_id: { bsonType: ["objectId", "null"] },
        student_id: { bsonType: ["string", "null"] },
        batch: { bsonType: ["int", "null"] },
        profile_picture: { bsonType: "string" },
        cover_photo: { bsonType: "string" },
        bio: { bsonType: ["string", "null"] },
        interests: {
          bsonType: ["array", "null"],
          items: { bsonType: "string" }
        },
        skills: {
          bsonType: ["array", "null"],
          items: { bsonType: "string" }
        },
        linkedin: { bsonType: ["string", "null"] },
        twitter: { bsonType: ["string", "null"] },
        id_verification: {
          bsonType: "object",
          properties: {
            file_path: { bsonType: "string" },
            uploaded_at: { bsonType: "date" },
            verified: { bsonType: "bool" }
          }
        },
        approved_by: { bsonType: ["objectId", "null"] },
        approved_at: { bsonType: ["date", "null"] },
        rejection_reason: { bsonType: ["string", "null"] },
        profile_visibility: {
          enum: ["public", "university", "connections", "private"]
        },
        is_deleted: { bsonType: "bool" },
        created_at: { bsonType: "date" }
      }
    }
  }
});
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ university_id: 1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ status: 1 });
// ===========================================
// 3. groups
// ===========================================
db.createCollection("groups");
/*
scope removed; all groups tied to a university
privacy: public | private | invite_only
*/
db.groups.createIndex({ name: 1 });
db.groups.createIndex({ creator_id: 1 });
db.groups.createIndex({ university_id: 1 });
/*
{
  name,
  description,
  category,
  privacy,
  university_id,
  creator_id,
  moderators,
  members_count,
  status,
  is_deleted,
  created_at
}
*/
// ===========================================
// 4. group_members
// ===========================================
db.createCollection("group_members");
db.group_members.createIndex({ group_id: 1, user_id: 1 }, { unique: true });
/*
{
  group_id,
  user_id,
  role: member | moderator | admin,
  status: active | banned,
  joined_at
}
*/
// ===========================================
// 5. group_messages
// ===========================================
db.createCollection("group_messages");
db.group_messages.createIndex({ group_id: 1, created_at: -1 });
/*
{
  group_id,
  user_id,
  message,
  edited,
  deleted,
  created_at
}
*/
// ===========================================
// 6. events
// ===========================================
db.createCollection("events");
db.events.createIndex({ date: 1 });
db.events.createIndex({ creator_id: 1 });
/*
scope removed; all events tied to a university
visibility: public | university | private
*/
db.events.createIndex({ university_id: 1 });
/*
{
  title,
  description,
  date,
  time,
  category,
  location,
  attendance,
  organizer,
  image,
  university_id,
  creator_id,
  visibility,
  approval_status,
  approved_by,
  is_deleted,
  created_at
}
*/
// ===========================================
// 7. event_rsvps
// ===========================================
db.createCollection("event_rsvps");
db.event_rsvps.createIndex({ event_id: 1, user_id: 1 }, { unique: true });
/*
{
  event_id,
  user_id,
  status,
  rsvp_at
}
*/
// ===========================================
// 8. posts
// ===========================================
db.createCollection("posts");
db.posts.createIndex({ user_id: 1 });
db.posts.createIndex({ timestamp: -1 });
/*
{
  user_id,
  content,
  is_deleted,
  timestamp
}
*/
// ===========================================
// 9. conversations
// ===========================================
db.createCollection("conversations");
db.conversations.createIndex({ participants: 1 });
/*
{
  participants: [user_id1, user_id2], // sorted array for uniqueness
  last_message_at,
  created_at
}
*/
// ===========================================
// 10. messages
// ===========================================
db.createCollection("messages");
db.messages.createIndex({ conversation_id: 1, timestamp: -1 });
/*
{
  conversation_id,
  sender_id,
  receiver_id,
  message,
  seen,
  timestamp
}
*/
// ===========================================
// 11. connections
// ===========================================
db.createCollection("connections");
db.connections.createIndex(
  { user_id1: 1, user_id2: 1 },
  { unique: true }
);
/*
{
  user_id1,
  user_id2,
  status: pending | accepted | rejected,
  connected_at
}
*/
// ===========================================
// 12. notifications
// ===========================================
db.createCollection("notifications");
db.notifications.createIndex({ user_id: 1, seen: 1 });
/*
{
  user_id,
  type,
  content,
  reference_id,
  seen,
  timestamp
}
*/
// ===========================================
// 13. reports
// ===========================================
db.createCollection("reports");
db.reports.createIndex({ status: 1 });
db.reports.createIndex({ type: 1 });
/*
{
  reporter_id,
  type: user | post | group | event,
  reported_user_id,
  reported_post_id,
  reported_group_id,
  reported_event_id,
  reason,
  status,
  resolved_by,
  resolved_at,
  admin_notes,
  timestamp
}
*/
// ===========================================
// 14. audit_logs
// ===========================================
db.createCollection("audit_logs");
db.audit_logs.createIndex({ admin_id: 1 });
db.audit_logs.createIndex({ timestamp: -1 });
/*
{
  admin_id,
  action,
  target_id,
  details,
  timestamp
}
*/
print("✅ Campus Connect Multi-Campus MongoDB schema created successfully");



//Insertingdata

use campus_connect

db.users.insertOne(
  {
    full_name: "Super Admin",
    email: "admin@test.com",
    password: "admin123",
    role: "super_admin",
    status: "approved",
    profile_visibility: "public",
    is_deleted: false,
    created_at: new Date(),
    bio: "Campus Connect Super Administrator",
    university_id: null,
    managed_university_id: null,
    student_id: null,
    batch: null
  },
  { bypassDocumentValidation: true }
)
