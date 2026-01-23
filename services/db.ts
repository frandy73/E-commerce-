
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
