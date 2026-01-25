
import { supabase } from "../supabaseConfig";
import { Product } from "../types";

const TABLE_NAME = "products";

// Chaje pwodui yo epi koute chanjman an tan reyèl
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  // 1. Chajman inisyal
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      callback(data as Product[]);
    }
  };

  fetchProducts();

  // 2. Koute chanjman (Realtime)
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Koute INSERT, UPDATE, ak DELETE
        schema: 'public',
        table: TABLE_NAME,
      },
      () => {
        // Lè gen yon chanjman, nou rechaje tout lis la
        fetchProducts();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Ajoute yon pwodui nan Supabase
export const addProductToDb = async (product: Omit<Product, "id">) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([product])
      .select();

    if (error) {
      console.error("❌ Erè Supabase Add:", error);
      console.error("Detay erè:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }

    console.log("✅ Pwodui ajoute avèk siksè:", data);
    return true;
  } catch (error) {
    console.error("❌ Erè inatandi:", error);
    return false;
  }
};

// Modifye yon pwodui
export const updateProductInDb = async (id: string, updates: Partial<Product>) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id);

    return !error;
  } catch (error) {
    console.error("Erè Supabase Update:", error);
    return false;
  }
};

// Efase yon pwodui
export const deleteProductFromDb = async (id: string) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    return !error;
  } catch (error) {
    console.error("Erè Supabase Delete:", error);
    return false;
  }
};

// --- Banner Management ---

export const subscribeToBanner = (callback: (banner: any) => void) => {
  const fetchBanner = async () => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('id', 1)
      .single();

    if (!error && data) {
      callback({
        ...data,
        promoText: data.promo_text,
        buttonText: data.button_text
      });
    }
  };

  fetchBanner();

  const channel = supabase
    .channel('banner-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'banners', filter: 'id=eq.1' },
      () => fetchBanner()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const updateBanner = async (bannerData: any) => {
  try {
    const dbData = {
      title: bannerData.title,
      subtitle: bannerData.subtitle,
      promo_text: bannerData.promoText,
      button_text: bannerData.buttonText,
      image: bannerData.image
    };

    const { error } = await supabase
      .from('banners')
      .update(dbData)
      .eq('id', 1);

    if (error) {
      // Si pa gen ranje (eg. premye fwa), eseye insert
      const { error: insertError } = await supabase.from('banners').insert([{ id: 1, ...dbData }]);
      return !insertError;
    }
    return true;
  } catch (error) {
    return false;
  }
};

// --- Category Management ---

export const subscribeToCategories = (callback: (categories: any[]) => void) => {
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      callback(data);
    }
  };

  fetchCategories();

  const channel = supabase
    .channel('category-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories' },
      () => fetchCategories()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const addCategoryToDb = async (name: string) => {
  try {
    const { error } = await supabase
      .from('categories')
      .insert([{ name }]);
    return !error;
  } catch (error) {
    console.error("Erè add kategori:", error);
    return false;
  }
};

export const updateCategoryInDb = async (id: number, name: string) => {
  try {
    const { error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id);
    return !error;
  } catch (error) {
    console.error("Erè update kategori:", error);
    return false;
  }
};

export const deleteCategoryFromDb = async (id: number) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    return !error;
  } catch (error) {
    console.error("Erè delete kategori:", error);
    return false;
  }
};
