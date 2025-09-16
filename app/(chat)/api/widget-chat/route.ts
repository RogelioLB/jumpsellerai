import {
  appendClientMessage,
  createDataStream,
  smoothStream,
  streamText,
} from 'ai';
import { systemPrompt } from '@/app/(chat)/api/chat/prompt';
import { postRequestBodySchema, type PostRequestBody } from '@/app/(chat)/api/chat/schema';
import { generateUUID } from '@/lib/utils';
import { isProductionEnvironment } from '@/lib/constants';
import { ChatSDKError } from '@/lib/errors';
import searchProduct from '@/app/(chat)/api/chat/tools/searchProduct';
import findCustomer from '@/app/(chat)/api/chat/tools/findCustomer';
import getCustomerOrders from '@/app/(chat)/api/chat/tools/getCustomerOrders';
import getDiscounts from '@/app/(chat)/api/chat/tools/getDiscounts';
import trackOrder from '@/app/(chat)/api/chat/tools/trackOrder';
import { getContext } from '@/lib/ai/tools/get-context';
import { getCategories } from '@/app/(chat)/api/chat/tools/getCategories';
import { getProductsByCategory } from '@/app/(chat)/api/chat/tools/getProductsByCategory';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 60;

export async function POST(request: Request) {
  console.log("Hola")
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const { message, selectedChatModel } = requestBody;

    // No auth, no DB interactions — just construct messages and stream a reply
    const messages = appendClientMessage({
      messages: [],
      message,
    });

    const stream = createDataStream({
      execute: (dataStream) => {
        const result = streamText({
          model: openai('gpt-4.1-nano'),
          system: systemPrompt,
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'searchProduct',
                  'findCustomer',
                  'getCustomerOrders',
                  'getDiscounts',
                  'trackOrder',
                  'getContext',
                  'getCategories',
                  'getProductsByCategory',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            searchProduct,
            findCustomer,
            getCustomerOrders,
            getDiscounts,
            trackOrder,
            getContext,
            getCategories,
            getProductsByCategory,
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();
        result.mergeIntoDataStream(dataStream, { sendReasoning: true });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });

    return new Response(stream);
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error(error);
    return new Response(error as string, { status: 500 });
  }
}
