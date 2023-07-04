import type { TSESTree } from "@typescript-eslint/types";
import type { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { createEslintRule } from "../utils";

export const RULE_NAME = "use-async-with-await";
export type MessageIds = "useAsyncWithAwait";
export type Options = [];

type FunctionNode=TSESTree.FunctionExpression|TSESTree.FunctionDeclaration
    |TSESTree.ArrowFunctionExpression

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "Enforce using async keyword with await.",
      recommended: "error",
    },
    fixable: "code",
    schema: [],
    messages: {
      useAsyncWithAwait: "Expect using async keyword with await.",
    },
  },
  defaultOptions: [],
  create: (context) => {
    let closestFunctionNode:FunctionNode|null=null

    function setupNode(node:FunctionNode){
      closestFunctionNode=node
    }
    function cleanupNode(){
      closestFunctionNode=null
    }

    return {
      "FunctionExpression[async=false]": setupNode,
      "FunctionExpression[async=false]:exit":cleanupNode,
      "FunctionDeclaration[async=false]": setupScope,
      "FunctionDeclaration[async=false]:exit":cleanupNode,
      "ArrowFunctionExpression[async=false]": setupScope,
      "ArrowFunctionExpression[async=false]:exit"
        :cleanupNode,
      AwaitExpression() {
        if(!closestFunctionNode||closestFunctionNode.async)return
        context.report({
          node,messageId:'useAsyncWithAwait',
          fix:fixer=>fixer.insertTextBefore(closestFunctionNode,'async ')
        })
      },
    };
  },
});
