'use client';
import { use } from 'react';

export default function TodayPage({params}:{params:Promise<{id:string}>}){const {id}=use(params);return (<div className='card'><h1 className='text-xl font-semibold mb-2'>Today (coming soon)</h1><p className='text-sm'>Class: {id}</p></div>);}
