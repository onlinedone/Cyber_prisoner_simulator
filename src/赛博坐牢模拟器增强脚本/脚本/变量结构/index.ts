import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';
import { Schema } from '../../界面/状态栏/schema';

$(() => {
  registerMvuSchema(Schema);
});
