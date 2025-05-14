"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ts = require("typescript");
const pureFunctionComment = '@__PURE__';
function getPrefixFunctionsTransformer() {
    return (context) => {
        const transformer = (sf) => {
            const topLevelFunctions = findTopLevelFunctions(sf);
            const pureImports = findPureImports(sf);
            const pureImportsComment = `* PURE_IMPORTS_START ${pureImports.join(',')} PURE_IMPORTS_END `;
            const visitor = (node) => {
                // Add the pure imports comment to the first node.
                if (node.parent && node.parent.parent === undefined && node.pos === 0) {
                    const newNode = ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, pureImportsComment, true);
                    // Replace node with modified one.
                    return ts.visitEachChild(newNode, visitor, context);
                }
                // Add pure function comment to top level functions.
                if (topLevelFunctions.has(node)) {
                    const newNode = ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, pureFunctionComment, false);
                    // Replace node with modified one.
                    return ts.visitEachChild(newNode, visitor, context);
                }
                // Otherwise return node as is.
                return ts.visitEachChild(node, visitor, context);
            };
            return ts.visitNode(sf, visitor);
        };
        return transformer;
    };
}
exports.getPrefixFunctionsTransformer = getPrefixFunctionsTransformer;
function findTopLevelFunctions(parentNode) {
    const topLevelFunctions = new Set();
    function cb(node) {
        // Stop recursing into this branch if it's a definition construct.
        // These are function expression, function declaration, class, or arrow function (lambda).
        // The body of these constructs will not execute when loading the module, so we don't
        // need to mark function calls inside them as pure.
        // Class static initializers in ES2015 are an exception we don't cover. They would need similar
        // processing as enums to prevent property setting from causing the class to be retained.
        if (ts.isFunctionDeclaration(node)
            || ts.isFunctionExpression(node)
            || ts.isClassDeclaration(node)
            || ts.isArrowFunction(node)) {
            return;
        }
        let noPureComment = !hasPureComment(node);
        let innerNode = node;
        while (innerNode && ts.isParenthesizedExpression(innerNode)) {
            innerNode = innerNode.expression;
            noPureComment = noPureComment && !hasPureComment(innerNode);
        }
        if (!innerNode) {
            return;
        }
        if (noPureComment) {
            if (ts.isNewExpression(innerNode)) {
                topLevelFunctions.add(node);
            }
            else if (ts.isCallExpression(innerNode)) {
                let expression = innerNode.expression;
                while (expression && ts.isParenthesizedExpression(expression)) {
                    expression = expression.expression;
                }
                if (expression) {
                    if (ts.isFunctionExpression(expression)) {
                        // Skip IIFE's with arguments
                        // This could be improved to check if there are any references to variables
                        if (innerNode.arguments.length === 0) {
                            topLevelFunctions.add(node);
                        }
                    }
                    else {
                        topLevelFunctions.add(node);
                    }
                }
            }
        }
        ts.forEachChild(innerNode, cb);
    }
    ts.forEachChild(parentNode, cb);
    return topLevelFunctions;
}
exports.findTopLevelFunctions = findTopLevelFunctions;
function findPureImports(parentNode) {
    const pureImports = [];
    ts.forEachChild(parentNode, cb);
    function cb(node) {
        if (node.kind === ts.SyntaxKind.ImportDeclaration
            && node.importClause) {
            // Save the path of the import transformed into snake case and remove relative paths.
            const moduleSpecifier = node.moduleSpecifier;
            const pureImport = moduleSpecifier.text
                .replace(/[\/@\-]/g, '_')
                .replace(/^\.+/, '');
            pureImports.push(pureImport);
        }
        ts.forEachChild(node, cb);
    }
    return pureImports;
}
exports.findPureImports = findPureImports;
function hasPureComment(node) {
    if (!node) {
        return false;
    }
    const leadingComment = ts.getSyntheticLeadingComments(node);
    return leadingComment && leadingComment.some((comment) => comment.text === pureFunctionComment);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4LWZ1bmN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfb3B0aW1pemVyL3NyYy90cmFuc2Zvcm1zL3ByZWZpeC1mdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCxpQ0FBaUM7QUFHakMsTUFBTSxtQkFBbUIsR0FBRyxXQUFXLENBQUM7QUFFeEM7SUFDRSxNQUFNLENBQUMsQ0FBQyxPQUFpQyxFQUFpQyxFQUFFO1FBQzFFLE1BQU0sV0FBVyxHQUFrQyxDQUFDLEVBQWlCLEVBQUUsRUFBRTtZQUV2RSxNQUFNLGlCQUFpQixHQUFHLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4QyxNQUFNLGtCQUFrQixHQUFHLHdCQUF3QixXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztZQUU3RixNQUFNLE9BQU8sR0FBZSxDQUFDLElBQWEsRUFBVyxFQUFFO2dCQUVyRCxrREFBa0Q7Z0JBQ2xELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdEUsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLDBCQUEwQixDQUMzQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFFeEUsa0NBQWtDO29CQUNsQyxNQUFNLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUN0RCxDQUFDO2dCQUVELG9EQUFvRDtnQkFDcEQsRUFB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O0lBQ25DLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0QsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBRTVELE1BQU0sQ0FBQyxjQUFjLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ2xHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuXG5jb25zdCBwdXJlRnVuY3Rpb25Db21tZW50ID0gJ0BfX1BVUkVfXyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcmVmaXhGdW5jdGlvbnNUcmFuc2Zvcm1lcigpOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+ID0+IHtcbiAgICBjb25zdCB0cmFuc2Zvcm1lcjogdHMuVHJhbnNmb3JtZXI8dHMuU291cmNlRmlsZT4gPSAoc2Y6IHRzLlNvdXJjZUZpbGUpID0+IHtcblxuICAgICAgY29uc3QgdG9wTGV2ZWxGdW5jdGlvbnMgPSBmaW5kVG9wTGV2ZWxGdW5jdGlvbnMoc2YpO1xuICAgICAgY29uc3QgcHVyZUltcG9ydHMgPSBmaW5kUHVyZUltcG9ydHMoc2YpO1xuICAgICAgY29uc3QgcHVyZUltcG9ydHNDb21tZW50ID0gYCogUFVSRV9JTVBPUlRTX1NUQVJUICR7cHVyZUltcG9ydHMuam9pbignLCcpfSBQVVJFX0lNUE9SVFNfRU5EIGA7XG5cbiAgICAgIGNvbnN0IHZpc2l0b3I6IHRzLlZpc2l0b3IgPSAobm9kZTogdHMuTm9kZSk6IHRzLk5vZGUgPT4ge1xuXG4gICAgICAgIC8vIEFkZCB0aGUgcHVyZSBpbXBvcnRzIGNvbW1lbnQgdG8gdGhlIGZpcnN0IG5vZGUuXG4gICAgICAgIGlmIChub2RlLnBhcmVudCAmJiBub2RlLnBhcmVudC5wYXJlbnQgPT09IHVuZGVmaW5lZCAmJiBub2RlLnBvcyA9PT0gMCkge1xuICAgICAgICAgIGNvbnN0IG5ld05vZGUgPSB0cy5hZGRTeW50aGV0aWNMZWFkaW5nQ29tbWVudChcbiAgICAgICAgICAgIG5vZGUsIHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSwgcHVyZUltcG9ydHNDb21tZW50LCB0cnVlKTtcblxuICAgICAgICAgIC8vIFJlcGxhY2Ugbm9kZSB3aXRoIG1vZGlmaWVkIG9uZS5cbiAgICAgICAgICByZXR1cm4gdHMudmlzaXRFYWNoQ2hpbGQobmV3Tm9kZSwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgcHVyZSBmdW5jdGlvbiBjb21tZW50IHRvIHRvcCBsZXZlbCBmdW5jdGlvbnMuXG4gICAgICAgIGlmICh0b3BMZXZlbEZ1bmN0aW9ucy5oYXMobm9kZSkpIHtcbiAgICAgICAgICBjb25zdCBuZXdOb2RlID0gdHMuYWRkU3ludGhldGljTGVhZGluZ0NvbW1lbnQoXG4gICAgICAgICAgICBub2RlLCB0cy5TeW50YXhLaW5kLk11bHRpTGluZUNvbW1lbnRUcml2aWEsIHB1cmVGdW5jdGlvbkNvbW1lbnQsIGZhbHNlKTtcblxuICAgICAgICAgIC8vIFJlcGxhY2Ugbm9kZSB3aXRoIG1vZGlmaWVkIG9uZS5cbiAgICAgICAgICByZXR1cm4gdHMudmlzaXRFYWNoQ2hpbGQobmV3Tm9kZSwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPdGhlcndpc2UgcmV0dXJuIG5vZGUgYXMgaXMuXG4gICAgICAgIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChub2RlLCB2aXNpdG9yLCBjb250ZXh0KTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB0cy52aXNpdE5vZGUoc2YsIHZpc2l0b3IpO1xuICAgIH07XG5cbiAgICByZXR1cm4gdHJhbnNmb3JtZXI7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kVG9wTGV2ZWxGdW5jdGlvbnMocGFyZW50Tm9kZTogdHMuTm9kZSk6IFNldDx0cy5Ob2RlPiB7XG4gIGNvbnN0IHRvcExldmVsRnVuY3Rpb25zID0gbmV3IFNldDx0cy5Ob2RlPigpO1xuXG4gIGZ1bmN0aW9uIGNiKG5vZGU6IHRzLk5vZGUpIHtcbiAgICAvLyBTdG9wIHJlY3Vyc2luZyBpbnRvIHRoaXMgYnJhbmNoIGlmIGl0J3MgYSBkZWZpbml0aW9uIGNvbnN0cnVjdC5cbiAgICAvLyBUaGVzZSBhcmUgZnVuY3Rpb24gZXhwcmVzc2lvbiwgZnVuY3Rpb24gZGVjbGFyYXRpb24sIGNsYXNzLCBvciBhcnJvdyBmdW5jdGlvbiAobGFtYmRhKS5cbiAgICAvLyBUaGUgYm9keSBvZiB0aGVzZSBjb25zdHJ1Y3RzIHdpbGwgbm90IGV4ZWN1dGUgd2hlbiBsb2FkaW5nIHRoZSBtb2R1bGUsIHNvIHdlIGRvbid0XG4gICAgLy8gbmVlZCB0byBtYXJrIGZ1bmN0aW9uIGNhbGxzIGluc2lkZSB0aGVtIGFzIHB1cmUuXG4gICAgLy8gQ2xhc3Mgc3RhdGljIGluaXRpYWxpemVycyBpbiBFUzIwMTUgYXJlIGFuIGV4Y2VwdGlvbiB3ZSBkb24ndCBjb3Zlci4gVGhleSB3b3VsZCBuZWVkIHNpbWlsYXJcbiAgICAvLyBwcm9jZXNzaW5nIGFzIGVudW1zIHRvIHByZXZlbnQgcHJvcGVydHkgc2V0dGluZyBmcm9tIGNhdXNpbmcgdGhlIGNsYXNzIHRvIGJlIHJldGFpbmVkLlxuICAgIGlmICh0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24obm9kZSlcbiAgICAgIHx8IHRzLmlzRnVuY3Rpb25FeHByZXNzaW9uKG5vZGUpXG4gICAgICB8fCB0cy5pc0NsYXNzRGVjbGFyYXRpb24obm9kZSlcbiAgICAgIHx8IHRzLmlzQXJyb3dGdW5jdGlvbihub2RlKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBub1B1cmVDb21tZW50ID0gIWhhc1B1cmVDb21tZW50KG5vZGUpO1xuICAgIGxldCBpbm5lck5vZGUgPSBub2RlO1xuICAgIHdoaWxlIChpbm5lck5vZGUgJiYgdHMuaXNQYXJlbnRoZXNpemVkRXhwcmVzc2lvbihpbm5lck5vZGUpKSB7XG4gICAgICBpbm5lck5vZGUgPSBpbm5lck5vZGUuZXhwcmVzc2lvbjtcbiAgICAgIG5vUHVyZUNvbW1lbnQgPSBub1B1cmVDb21tZW50ICYmICFoYXNQdXJlQ29tbWVudChpbm5lck5vZGUpO1xuICAgIH1cblxuICAgIGlmICghaW5uZXJOb2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5vUHVyZUNvbW1lbnQpIHtcbiAgICAgIGlmICh0cy5pc05ld0V4cHJlc3Npb24oaW5uZXJOb2RlKSkge1xuICAgICAgICB0b3BMZXZlbEZ1bmN0aW9ucy5hZGQobm9kZSk7XG4gICAgICB9IGVsc2UgaWYgKHRzLmlzQ2FsbEV4cHJlc3Npb24oaW5uZXJOb2RlKSkge1xuICAgICAgICBsZXQgZXhwcmVzc2lvbjogdHMuRXhwcmVzc2lvbiA9IGlubmVyTm9kZS5leHByZXNzaW9uO1xuICAgICAgICB3aGlsZSAoZXhwcmVzc2lvbiAmJiB0cy5pc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uKGV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24uZXhwcmVzc2lvbjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXhwcmVzc2lvbikge1xuICAgICAgICAgIGlmICh0cy5pc0Z1bmN0aW9uRXhwcmVzc2lvbihleHByZXNzaW9uKSkge1xuICAgICAgICAgICAgLy8gU2tpcCBJSUZFJ3Mgd2l0aCBhcmd1bWVudHNcbiAgICAgICAgICAgIC8vIFRoaXMgY291bGQgYmUgaW1wcm92ZWQgdG8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSByZWZlcmVuY2VzIHRvIHZhcmlhYmxlc1xuICAgICAgICAgICAgaWYgKGlubmVyTm9kZS5hcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIHRvcExldmVsRnVuY3Rpb25zLmFkZChub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9wTGV2ZWxGdW5jdGlvbnMuYWRkKG5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRzLmZvckVhY2hDaGlsZChpbm5lck5vZGUsIGNiKTtcbiAgfVxuXG4gIHRzLmZvckVhY2hDaGlsZChwYXJlbnROb2RlLCBjYik7XG5cbiAgcmV0dXJuIHRvcExldmVsRnVuY3Rpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZFB1cmVJbXBvcnRzKHBhcmVudE5vZGU6IHRzLk5vZGUpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHB1cmVJbXBvcnRzOiBzdHJpbmdbXSA9IFtdO1xuICB0cy5mb3JFYWNoQ2hpbGQocGFyZW50Tm9kZSwgY2IpO1xuXG4gIGZ1bmN0aW9uIGNiKG5vZGU6IHRzLk5vZGUpIHtcbiAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uXG4gICAgICAmJiAobm9kZSBhcyB0cy5JbXBvcnREZWNsYXJhdGlvbikuaW1wb3J0Q2xhdXNlKSB7XG5cbiAgICAgIC8vIFNhdmUgdGhlIHBhdGggb2YgdGhlIGltcG9ydCB0cmFuc2Zvcm1lZCBpbnRvIHNuYWtlIGNhc2UgYW5kIHJlbW92ZSByZWxhdGl2ZSBwYXRocy5cbiAgICAgIGNvbnN0IG1vZHVsZVNwZWNpZmllciA9IChub2RlIGFzIHRzLkltcG9ydERlY2xhcmF0aW9uKS5tb2R1bGVTcGVjaWZpZXIgYXMgdHMuU3RyaW5nTGl0ZXJhbDtcbiAgICAgIGNvbnN0IHB1cmVJbXBvcnQgPSBtb2R1bGVTcGVjaWZpZXIudGV4dFxuICAgICAgICAucmVwbGFjZSgvW1xcL0BcXC1dL2csICdfJylcbiAgICAgICAgLnJlcGxhY2UoL15cXC4rLywgJycpO1xuICAgICAgcHVyZUltcG9ydHMucHVzaChwdXJlSW1wb3J0KTtcbiAgICB9XG5cbiAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgY2IpO1xuICB9XG5cbiAgcmV0dXJuIHB1cmVJbXBvcnRzO1xufVxuXG5mdW5jdGlvbiBoYXNQdXJlQ29tbWVudChub2RlOiB0cy5Ob2RlKSB7XG4gIGlmICghbm9kZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBsZWFkaW5nQ29tbWVudCA9IHRzLmdldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhub2RlKTtcblxuICByZXR1cm4gbGVhZGluZ0NvbW1lbnQgJiYgbGVhZGluZ0NvbW1lbnQuc29tZSgoY29tbWVudCkgPT4gY29tbWVudC50ZXh0ID09PSBwdXJlRnVuY3Rpb25Db21tZW50KTtcbn1cbiJdfQ==