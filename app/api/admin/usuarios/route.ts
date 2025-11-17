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

// GET /api/admin/usuarios - Listar todos los usuarios
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Obtener todos los usuarios
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error al listar usuarios:', error);
      return NextResponse.json(
        { error: 'Error al obtener usuarios', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error en API de usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/usuarios - Crear un nuevo usuario
export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { 
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      email, 
      telefono,
      fecha_nacimiento,
      edad,
      password,
    } = body;

    // Validaciones
    if (!primer_nombre || !primer_apellido || !email || !telefono || !fecha_nacimiento) {
      return NextResponse.json(
        { error: 'Primer nombre, primer apellido, email, teléfono y fecha de nacimiento son requeridos' },
        { status: 400 }
      );
    }

    if (!password || password.length < 10) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 10 caracteres' },
        { status: 400 }
      );
    }

    // Validar que tenga al menos 2 caracteres especiales
    const specialChars = password.match(/[!@#$%^&*(),.?":{}|<>]/g);
    if (!specialChars || specialChars.length < 2) {
      return NextResponse.json(
        { error: 'La contraseña debe contener al menos 2 caracteres especiales' },
        { status: 400 }
      );
    }

    // Crear usuario con admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar el email
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
    });

    if (error) {
      console.error('Error al crear usuario:', error);
      return NextResponse.json(
        { error: error.message || 'Error al crear usuario' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      user: data.user,
      message: 'Usuario creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error en API de crear usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/usuarios/[id] - Actualizar un usuario (se maneja en route por ID)
// Este endpoint se implementará en [id]/route.ts

