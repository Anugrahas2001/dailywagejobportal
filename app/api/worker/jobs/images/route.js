import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import WorkerSession from "@/modals/WorkerSession";
import { connectDB } from "@/lib/mongodb";

const BUCKET = "ImageBucket";
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Must produce the SAME format you store in workDate when the session is created
const getWorkDate = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(),
  ); // "YYYY-MM-DD"

export async function PUT(request) {
  const uploadedPaths = []; // for cleanup if something fails

  try {

    await connectDB();
const {uid}=await verifyFirebaseToken(request);
    // 2. Parse and validate input (before touching storage)
    const formData = await request.formData();
    const jobId = formData.get("jobId");
    const files = formData.getAll("images");

    if (!jobId || files.length === 0 || files.length > MAX_FILES) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    for (const file of files) {
      if (
        !(file instanceof File) ||
        !ALLOWED_TYPES[file.type] ||
        file.size > MAX_SIZE
      ) {
        return NextResponse.json(
          { error: "Only JPG, PNG or WEBP images up to 5MB are allowed" },
          { status: 400 },
        );
      }
    }

    // 3. Make sure today's session exists BEFORE uploading anything
    const workDate = getWorkDate();
    const session = await WorkerSession.findOne({
      jobId,
      workerId: uid,
      workDate,
    }).select("_id");

    if (!session) {
      return NextResponse.json(
        { error: "No work session found for today. Start work first." },
        { status: 404 },
      );
    }

    // 4. Upload to Supabase
    const urls = [];

    for (const file of files) {
      const ext = ALLOWED_TYPES[file.type]; // from MIME type, not from the user's file name
      const path = `${uid}/${jobId}/${workDate}/${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: file.type, upsert: false });

      if (error) {
        console.error("Supabase upload error:", error);
        await supabase.storage.from(BUCKET).remove(uploadedPaths); // remove orphans
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
      }

      uploadedPaths.push(path);
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    // 5. Save URLs to the session (append, don't overwrite)
    const updated = await WorkerSession.findByIdAndUpdate(
      session._id,
      { $push: { workPics: { $each: urls } } },
      { new: true },
    );

    if (!updated) {
      await supabase.storage.from(BUCKET).remove(uploadedPaths);
      return NextResponse.json(
        { error: "Session update failed" },
        { status: 500 },
      );
    }
    console.log(urls, "aaaAASDSDFF", updated.workPics, "CHECK THIS AS WELL ");
    return NextResponse.json(
      {
        message: "Successfully uploaded the work place images.",
        urls,
        workPics: updated.workPics,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    if (uploadedPaths.length) {
      await supabase.storage
        .from(BUCKET)
        .remove(uploadedPaths)
        .catch(() => {});
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
