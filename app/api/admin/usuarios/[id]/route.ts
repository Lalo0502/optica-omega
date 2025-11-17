import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Crear cliente admin (reutilizable)
const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// PATCH /api/admin/usuarios/[id] - Actualizar un usuario
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { 
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      telefono,
      fecha_nacimiento,
      edad,
    } = body;

    // Validaciones
    if (!primer_nombre || !primer_apellido || !telefono || !fecha_nacimiento) {
      return NextResponse.json(
        { error: 'Primer nombre, primer apellido, teléfono y fecha de nacimiento son requeridos' },
        { status: 400 }
      );
    }

    // Actualizar usuario con admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      params.id,
      {
        user_metadata: {
          primer_nombre,
          segundo_nombre: segundo_nombre || null,
          primer_apellido,
          segundo_apellido: segundo_apellido || null,
          telefono,
          fecha_nacimiento,
          edad,
          nombre_completo: `${primer_nombre} ${segundo_nombre || ''} ${primer_apellido} ${segundo_apellido || ''}`.trim(),
        },
      }
    );

    if (error) {
      console.error('Error al actualizar usuario:', error);
      return NextResponse.json(
        { error: error.message || 'Error al actualizar usuario' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      user: data.user,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error en API de actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/usuarios/[id] - Eliminar un usuario
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Eliminar usuario con admin API
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(
      params.id
    );

    if (error) {
      console.error('Error al eliminar usuario:', error);
      return NextResponse.json(
        { error: error.message || 'Error al eliminar usuario' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error: any) {
    console.error('Error en API de eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
