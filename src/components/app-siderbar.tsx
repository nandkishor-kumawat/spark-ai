import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger
} from "./ui/sidebar";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { auth } from "@/auth";
import NewChatButton from "./new-chat-button";
import SidebarHistory from "./sidebar-history";
import SIdebarUserNav from "./sidebar-user-nav";


export default async function AppSidebar() {

  const session = await auth()

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex items-center justify-between px-2">
            <SidebarTrigger className="text-gray-400 hover:text-gray-300" />
            <NewChatButton />
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={session?.user} />
      </SidebarContent>


      <SidebarFooter>
        {session?.user && <SIdebarUserNav user={session.user} />}
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  )
}
