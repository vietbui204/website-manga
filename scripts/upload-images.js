/*
  Script: upload-images.js
  - Scans assets/images/<mangaSlug>/<chapterSlug> and uploads each file to
    Supabase Storage under the same path.
  - Requires env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BUCKET
  - Usage: set env vars then: node scripts/upload-images.js
*/

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const IMAGES_DIR = path.join(__dirname, '..', 'assets', 'images');

function fatal(msg) { console.error(msg); process.exit(1); }

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role required for server uploads
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'manga-images';

if(!SUPABASE_URL || !SUPABASE_KEY) fatal('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function ensureBucket(){
  console.log('Checking buckets...');
  const res = await supabase.storage.listBuckets();
  const buckets = res && res.data ? res.data : null;
  if(res && res.error){
    console.error('Error listing buckets:', res.error.message || res.error);
    // If listing buckets failed due to permission, abort with helpful message
    fatal('Cannot list storage buckets. Check SUPABASE_SERVICE_ROLE_KEY and network settings.');
  }
  if(!buckets || !Array.isArray(buckets)){
    console.log('No buckets returned from Supabase; attempting to create bucket', SUPABASE_BUCKET);
    const { error: createErr } = await supabase.storage.createBucket(SUPABASE_BUCKET, { public: true });
    if(createErr) fatal('Failed to create bucket: ' + (createErr.message || JSON.stringify(createErr)));
    return;
  }
  const exists = buckets.find(b=>b && b.name===SUPABASE_BUCKET);
  if(!exists){
    console.log('Creating bucket', SUPABASE_BUCKET);
    const { error: createErr } = await supabase.storage.createBucket(SUPABASE_BUCKET, { public: true });
    if(createErr) fatal('Failed to create bucket: ' + (createErr.message || JSON.stringify(createErr)));
  } else {
    console.log('Bucket exists:', SUPABASE_BUCKET);
  }
}

function detectContentType(fileName){
  const ext = path.extname(fileName).toLowerCase();
  if(ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if(ext === '.png') return 'image/png';
  if(ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

async function uploadFile(localPath, destPath){
  const file = fs.readFileSync(localPath);
  const contentType = detectContentType(localPath);
  console.log('Uploading', destPath);
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(destPath, file, { upsert: true, contentType });
  if(error) console.error('Upload error', destPath, error.message);
}

async function walkAndUpload(){
  if(!fs.existsSync(IMAGES_DIR)) fatal('No images dir: ' + IMAGES_DIR);
  await ensureBucket();

  const mangas = fs.readdirSync(IMAGES_DIR, { withFileTypes: true }).filter(d=>d.isDirectory()).map(d=>d.name);
  const tasks = [];
  for(const manga of mangas){
    const mangaDir = path.join(IMAGES_DIR, manga);
    const chapters = fs.readdirSync(mangaDir, { withFileTypes: true }).filter(d=>d.isDirectory()).map(d=>d.name);
    for(const chapter of chapters){
      const chapDir = path.join(mangaDir, chapter);
      const files = fs.readdirSync(chapDir).filter(f=>f.match(/\.(jpg|jpeg|png|webp)$/i)).sort();
      for(const file of files){
        const localPath = path.join(chapDir, file);
        const destPath = `${manga}/${chapter}/${file}`;
        tasks.push({ localPath, destPath });
      }
    }
  }

  // Simple concurrency control
  const CONCURRENCY = Number(process.env.UPLOAD_CONCURRENCY || 6);
  let index = 0;
  async function worker(id){
    while(index < tasks.length){
      const current = index++;
      const t = tasks[current];
      try {
        await uploadFile(t.localPath, t.destPath);
      } catch (e) {
        console.error('Worker', id, 'failed', t.destPath, e.message);
      }
    }
  }
  const workers = Array.from({length: Math.min(CONCURRENCY, tasks.length || 1)}, (_,i)=>worker(i+1));
  await Promise.all(workers);
}

walkAndUpload().then(()=>console.log('Done')).catch(err=>{ console.error(err); process.exit(1); });
