import { db } from "@/lib/db";
import {
  forms,
  integrationBacklogConnections,
  integrationBacklogFormSettings,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { makeBacklogFormSettingsHandlers } from "@/lib/backlog/form-settings-handlers";

const { GET, PUT } = makeBacklogFormSettingsHandlers({
  db,
  schema: {
    forms,
    integrationBacklogConnections,
    integrationBacklogFormSettings,
  },
  eq,
});

export { GET, PUT };
