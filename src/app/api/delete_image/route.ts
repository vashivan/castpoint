import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { db } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';

cloudinary.config({
  cloud_name: 'dkchysebn',
  api_key: '145289783927229',
  api_secret: '7qoYAYHu6Pq__ssQSR7YoZt8goA',
});

export async function POST(req: NextRequest) {
  try {
    const { public_id } = await req.json();
    const trimmedPublicId = public_id.trim();
    const result = await cloudinary.uploader.destroy(trimmedPublicId);
    console.log('Cloudinary delete result:', result);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}


// export async function POST(req: NextRequest) {
//   try {
//     const { public_id } = await req.json();
//     console.log('Received public_id:', public_id);
    

    // if (!public_id) {
    //   return NextResponse.json({ error: 'Missing public_id' }, { status: 400 });
    // }

    // if (!token) {
    //   return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
    // }



    // Видалити фото з Cloudinary
    // const result = await cloudinary.uploader.destroy(public_id);


//     console.log('deleted');
//     return NextResponse.json({ result });
//   } catch (error) {
//     console.error('Error deleting image:', error);
//     return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
//   }
// }


// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   return NextResponse.json({ message: 'Route is working!' });
// }