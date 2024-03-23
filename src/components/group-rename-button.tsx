import React, { useTransition } from 'react'
import { MdEdit } from 'react-icons/md'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useParams, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { renameGroupChat } from '@/actions';

export default function GroupRenameButton({ group }: any) {

  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [name, setName] = React.useState(group.name);
  const ref = React.useRef<HTMLButtonElement>(null);

  const renameGroup = async () => {
    startTransition(async () => {
      await renameGroupChat(group.id, name);
      ref.current?.click();
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='group-hover:visible invisible px-1 py-1.5 bg-transparent hover:bg-transparent'>
          <MdEdit className='hover:text-white text-zinc-400 cursor-pointer' />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename group</DialogTitle>
        </DialogHeader>
        <div className="flex items-center flex-wrap gap-2">
          <div className="grid flex-1 gap-2 basis-64">
            <label htmlFor="name" className="sr-only">
              Group name
            </label>
            <Input
              id="name"
              defaultValue={group.name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>
          <Button type="button" variant="secondary" onClick={renameGroup} disabled={isPending}>
            {isPending ? 'Renaming...' : 'Rename'}
          </Button>

          <div className="hidden">
            <DialogClose asChild>
              <Button type="button" variant="secondary" ref={ref}>
                Close
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
