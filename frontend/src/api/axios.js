// هذا الملف بقى "شيم" (compatibility shim) بعد الانتقال من الـ Node/Express API
// القديم إلى Supabase. باقي الصفحات في المشروع بتستورد من '../api/axios'
// زي: import { endpoints } from '../api/axios'
// فبدل ما نعدّل كل صفحة، سيبنا نفس المسار لكن حوّلناه لمصدر Supabase.

export { supabase as api } from './supabaseClient';
export { endpoints } from './supabase';
