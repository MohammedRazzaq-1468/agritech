import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function seedUsers() {
  console.log('Seeding initial farmer and admin in Supabase Auth & Profiles...');

  const usersToSeed = [
    {
      email: 'farmer@agrismart.ai',
      password: 'Farmer@123456',
      fullName: 'Rajesh Kumar',
      role: 'farmer',
      state: 'Punjab',
      district: 'Ludhiana',
      farmSize: 4.5
    },
    {
      email: 'admin@agrismart.ai',
      password: 'Admin@123456',
      fullName: 'System Administrator',
      role: 'admin',
      state: 'Delhi',
      district: 'New Delhi',
      farmSize: 0
    }
  ];

  for (const u of usersToSeed) {
    try {
      // Check if user already exists
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existing = listData?.users?.find(x => x.email === u.email);

      let userId = existing?.id;

      if (!existing) {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: {
            full_name: u.fullName
          }
        });

        if (createError) {
          console.error(`Failed to create ${u.email}:`, createError);
          continue;
        }
        userId = newUser.user.id;
        console.log(`Created Auth user: ${u.email} -> ${userId}`);
      } else {
        console.log(`User ${u.email} already exists -> ${userId}`);
      }

      // Upsert into public.profiles
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          full_name: u.fullName,
          role: u.role,
          state: u.state,
          district: u.district,
          farm_size: u.farmSize,
          farm_size_unit: 'acre',
          preferred_language: 'en'
        }, { onConflict: 'id' });

      if (profileError) {
        console.error(`Failed to upsert profile for ${u.email}:`, profileError);
      } else {
        console.log(`✅ Upserted profile for ${u.email} (${u.role})`);
      }
    } catch (err) {
      console.error(`Error processing ${u.email}:`, err);
    }
  }

  // Verify profiles table
  const { data: profiles, error: pError } = await supabaseAdmin.from('profiles').select('*');
  console.log('Profiles in DB:', profiles?.length, pError || '');
}

seedUsers();

