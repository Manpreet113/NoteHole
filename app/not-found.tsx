import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { House } from 'lucide-react'
 
export default function NotFound() {
  return (
    <div className='flex min-h-dvh items-center justify-center flex-col space-y-4'>
        <h1 className='text-2xl font-bold'>404</h1>
        <div className='h-1 w-8 bg-amber-50'/>
        <h2 className='text-lg text-muted-foreground'>Page Not Found</h2>
        <h3 className='text-sm text-muted-foreground'>The page you are looking for does not exist.</h3>
        <Link href="/"><Button><House /><span>Return Home</span></Button></Link>
    </div>
  )
}