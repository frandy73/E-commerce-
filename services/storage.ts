import { supabase } from "../supabaseConfig";

const BUCKET_NAME = "product-images";

/**
 * Upload yon foto pwodui nan Supabase Storage
 * @param file - Fichye foto a (File object)
 * @returns URL foto a si upload la reyisi, null si li echwe
 */
export const uploadProductImage = async (file: File): Promise<string | null> => {
    try {
        // Kreye yon non inik pou foto a
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        console.log("📤 Upload foto:", fileName);

        // Upload foto a nan Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error("❌ Erè upload:", error);
            return null;
        }

        // Jwenn URL piblik foto a
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        console.log("✅ Foto upload avèk siksè:", urlData.publicUrl);
        return urlData.publicUrl;

    } catch (error) {
        console.error("❌ Erè inatandi pandan upload:", error);
        return null;
    }
};

/**
 * Efase yon foto pwodui nan Supabase Storage
 * @param imageUrl - URL konplè foto a
 * @returns true si efasman reyisi, false si li echwe
 */
export const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
    try {
        // Ekstrak path foto a soti nan URL la
        const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
        if (urlParts.length < 2) {
            console.warn("⚠️ URL foto a pa valid pou efasman");
            return false;
        }

        const filePath = urlParts[1];

        console.log("🗑️ Efase foto:", filePath);

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error("❌ Erè efasman:", error);
            return false;
        }

        console.log("✅ Foto efase avèk siksè");
        return true;

    } catch (error) {
        console.error("❌ Erè inatandi pandan efasman:", error);
        return false;
    }
};

/**
 * Verifye si bucket "product-images" egziste
 * @returns true si bucket la egziste, false si li pa egziste
 */
export const checkStorageBucket = async (): Promise<boolean> => {
    try {
        const { data, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error("❌ Erè nan verifye bucket:", error);
            return false;
        }

        const bucketExists = data?.some(bucket => bucket.name === BUCKET_NAME);

        if (!bucketExists) {
            console.warn(`⚠️ Bucket "${BUCKET_NAME}" pa egziste. Gade setup_storage.sql pou enstriksyon.`);
        }

        return bucketExists || false;

    } catch (error) {
        console.error("❌ Erè inatandi:", error);
        return false;
    }
};
