import supabase from '../supabase/supabase';

export const getProperties = async (activeOnly = true) => {
  try {
    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (activeOnly) {
      query = query.eq('status', 'active');
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    console.log('✅ Loaded', data.length, 'properties');
    
    // Convert snake_case to camelCase
    return (data || []).map(item => ({
      ...item,
      thumbnailIndex: item.thumbnail_index || 0,
    }));
  } catch (error) {
    console.error('❌ getProperties error:', error);
    return [];
  }
};

export const getPropertyById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Convert snake_case to camelCase
    return {
      ...data,
      thumbnailIndex: data.thumbnail_index || 0,
    };
  } catch (error) {
    console.error('❌ getPropertyById error:', error);
    return null;
  }
};

export const createProperty = async (propertyData) => {
  try {
    // Convert camelCase to snake_case for database
    const dbData = {
      title: propertyData.title,
      description: propertyData.description,
      price: propertyData.price,
      category: propertyData.category,
      area: propertyData.area,
      images: propertyData.images,
      status: propertyData.status,
      thumbnail_index: propertyData.thumbnailIndex || 0,
    };
    
    const { data, error } = await supabase
      .from('properties')
      .insert([dbData])
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Property created with thumbnail_index:', data.thumbnail_index);
    
    // Convert back to camelCase
    return {
      ...data,
      thumbnailIndex: data.thumbnail_index || 0,
    };
  } catch (error) {
    console.error('❌ createProperty error:', error);
    throw error;
  }
};

export const updateProperty = async (id, updates) => {
  try {
    // Convert camelCase to snake_case for database
    const dbUpdates = { ...updates };
    
    if (updates.thumbnailIndex !== undefined) {
      dbUpdates.thumbnail_index = updates.thumbnailIndex;
      delete dbUpdates.thumbnailIndex;
    }
    
    console.log('📝 Updating property with:', dbUpdates);
    
    const { data, error } = await supabase
      .from('properties')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Property updated, thumbnail_index:', data.thumbnail_index);
    
    // Convert back to camelCase
    return {
      ...data,
      thumbnailIndex: data.thumbnail_index || 0,
    };
  } catch (error) {
    console.error('❌ updateProperty error:', error);
    throw error;
  }
};

export const deleteProperty = async (id) => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    console.log('✅ Property deleted');
    return true;
  } catch (error) {
    console.error('❌ deleteProperty error:', error);
    throw error;
  }
};

export const togglePropertyStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
  
  try {
    const { data, error } = await supabase
      .from('properties')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Status toggled to:', newStatus);
    
    return {
      ...data,
      thumbnailIndex: data.thumbnail_index || 0,
    };
  } catch (error) {
    console.error('❌ togglePropertyStatus error:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    console.log('✅ Loaded', data.length, 'categories');
    return data || [];
  } catch (error) {
    console.error('❌ getCategories error:', error);
    return [];
  }
};

export const getAreas = async () => {
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .order('name');
    
    if (error) throw error;
    console.log('✅ Loaded', data.length, 'areas');
    return data || [];
  } catch (error) {
    console.error('❌ getAreas error:', error);
    return [];
  }
};
