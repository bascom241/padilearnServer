import type { StartConversation } from "./message.types.js";
import { validateRequestBodyWithValues } from "../../../utils/validateRequestBody.js";
import { AppError } from "../../../error/AppError.js";
import converstionModel from "../conversations/converstion.model.js";
export const startConversation = async (data: StartConversation, userId: string) => {
    validateRequestBodyWithValues<StartConversation>(data, ["title"]); 

    if(!userId || userId === null){
        throw new AppError("userid is required", 400)
    }; 

    const {title, conversationId} = data


}