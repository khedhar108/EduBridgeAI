/* global console */
import process from "node:process";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing");
const sql = postgres(url, { max: 1, prepare: false });

try {
  const users = await sql`select id, email, raw_user_meta_data->>'role' as role, email_confirmed_at is not null as confirmed, created_at from auth.users order by created_at;`;
  console.log("\n== auth.users ==", users.length, "rows");
  for (const u of users) console.log(`  ${u.email}  role=${u.role ?? "(none)"}  confirmed=${u.confirmed}  id=${String(u.id).slice(0,8)}`);

  const profiles = await sql`select p.id, p.full_name, u.email from profiles p join auth.users u on u.id = p.id;`;
  console.log("\n== profiles ==", profiles.length, "rows");
  for (const p of profiles) console.log(`  ${p.email}  name=${p.full_name ?? "(null)"}`);

  const members = await sql`
    select sm.school_id, s.slug as school, sm.role, u.email
    from school_members sm
    join schools s on s.id = sm.school_id
    left join auth.users u on u.id = sm.user_id
    order by s.slug, sm.role;`;
  console.log("\n== school_members ==", members.length, "rows");
  for (const m of members) console.log(`  ${m.school}  ${m.role}  ${m.email ?? "(no auth user)"}`);

  const schools = await sql`select slug, name, official_email_domain from schools order by slug;`;
  console.log("\n== schools ==", schools.length, "rows");
  for (const s of schools) console.log(`  ${s.slug}  ${s.name}  domain=${s.official_email_domain}`);

  const reqs = await sql`select status, count(*)::int as n from membership_requests group by status;`;
  console.log("\n== membership_requests ==", reqs);
  const invs = await sql`select accepted_at is not null as accepted, count(*)::int as n from invitations group by 1;`;
  console.log("\n== invitations ==", invs);
} catch (e) {
  console.error("inspect failed:", e.message);
  process.exit(1);
} finally {
  await sql.end();
}
