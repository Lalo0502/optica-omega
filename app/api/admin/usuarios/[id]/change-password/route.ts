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

// PATCH /api/admin/usuarios/[id]/change-password - Cambiar contraseña de un usuario
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { password } = body;

    // Validaciones
    if (!password) {
      return NextResponse.json(
        { error: 'La contraseña es requerida' },
        { status: 400 }
      );
    }

    if (password.length < 10) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 10 caracteres' },
        { status: 400 }
      );
    }

    // Validar que tenga al menos 2 caracteres especiales
    const specialChars = password.match(/[!@#$%^&*(),.?":{}|<>_+\-=[\]\\;'/]/g);
    if (!specialChars || specialChars.length < 2) {
      return NextResponse.json(
        { error: 'La contraseña debe contener al menos 2 caracteres especiales' },
        { status: 400 }
      );
    }

    // Actualizar contraseña con admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      params.id,
      {
        password: password,
      }
    );

    if (error) {
      console.error('Error al cambiar contraseña:', error);
      return NextResponse.json(
        { error: error.message || 'Error al cambiar contraseña' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en API de cambiar contraseña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
