import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uxvsqjektsssfvsfprtd.supabase.co";
const supabaseAnonKey = "sb_publishable_8FxDfdABOsTVF43RmVlQvQ_cgwOB77_";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET = "leave-documents";

/**
 * Uploads a file to Supabase Storage (PRIVATE bucket).
 * Returns the file PATH stored in the bucket — NOT a public URL.
 * The path is what we save in the database.
 *
 * @param file   - The File object to upload
 * @param folder - Subfolder within the bucket (e.g. "overseas-leave")
 * @returns The file path string (e.g. "overseas-leave/1234567_passport.pdf"), or null on error
 */
export async function uploadDocument(file: File, folder: string): Promise<string | null> {
    const filePath = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { upsert: false });

    if (error) {
        console.error("Supabase upload error:", error.message);
        return null;
    }

    // Return the PATH only — NOT a public URL
    return filePath;
}

/**
 * Generates a short-lived signed URL for a stored file.
 * Only authorised users who already know the path can request this.
 * The URL expires after 'expiresIn' seconds (default: 1 hour).
 *
 * @param filePath  - The path stored in the database (e.g. "overseas-leave/1234_passport.pdf")
 * @param expiresIn - Lifetime in seconds (default 3600 = 1 hour)
 * @returns A temporary signed URL string, or null on error
 */
export async function getSignedUrl(filePath: string, expiresIn = 3600): Promise<string | null> {
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(filePath, expiresIn);

    if (error) {
        if (!error.message.includes("Object not found")) {
            console.error("Signed URL error:", error.message);
        }
        return null;
    }

    return data.signedUrl;
}

const HRMS_BUCKET = "hrms-documents";

export async function uploadHrmsDocument(file: File, folder: string): Promise<string | null> {
    const filePath = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    const { error } = await supabase.storage
        .from(HRMS_BUCKET)
        .upload(filePath, file, { upsert: false });

    if (error) {
        console.error("Supabase HRMS upload error:", error.message);
        return null;
    }

    return filePath;
}

export async function getHrmsSignedUrl(filePath: string, expiresIn = 3600): Promise<string | null> {
    const { data, error } = await supabase.storage
        .from(HRMS_BUCKET)
        .createSignedUrl(filePath, expiresIn);

    if (error) {
        console.error("HRMS Signed URL error:", error.message);
        return null;
    }

    return data.signedUrl;
}
