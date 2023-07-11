"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkContextFilePresent = exports.checkAdminEmailSetup = void 0;
const cdk_context_template_json_1 = __importDefault(require("../../cdk.context.template.json"));
function checkAdminEmailSetup(adminEmail) {
    if (adminEmail === undefined) {
        console.warn('****************************************************************');
        console.warn('*** ⛔️ WARNING: You must provide a valid adminEmail address   ***');
        console.warn('*** you can do this by editing cdk.context.json 🚀            ***');
        console.warn('****************************************************************');
        console.error('🛑 No adminEmail entered. Please try again');
        process.exit(1);
    }
    else {
        console.info('✅ Successfully set up adminEmail');
    }
}
exports.checkAdminEmailSetup = checkAdminEmailSetup;
function checkContextFilePresent(scope) {
    for (const key in cdk_context_template_json_1.default) {
        const context = scope.node.tryGetContext(key);
        if (context === undefined) {
            console.warn('****************************************************************************************');
            console.warn(`*** ⛔️ WARNING: You must provide a valid ${key} value in cdk.context.json ******`);
            console.warn('*** ❓ Did you make a copy of cdk.context.template.json?                    ************');
            console.warn('*** ❓ Did you fill in all the required values for cdk context?             ************');
            console.warn('*** 💻 you can do this by editing cdk.context.json 🚀                       ************');
            console.warn('****************************************************************************************');
            console.error(`🛑 No ${key} entered. Please try again`);
            console.error(`🛑 You may need to copy cdk.context.template.json and rename the copied file as cdk.context.json`);
            process.exit(1);
        }
        else {
            console.info(`✅ Successfully defined ${key} as ${context} in context 🎉`);
        }
    }
}
exports.checkContextFilePresent = checkContextFilePresent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXBDaGVjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNldHVwQ2hlY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsZ0dBQTZEO0FBRTdELFNBQWdCLG9CQUFvQixDQUFDLFVBQWtCO0lBQ3JELElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtRQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLGtFQUFrRSxDQUFDLENBQUE7UUFDaEYsT0FBTyxDQUFDLElBQUksQ0FBQyxtRUFBbUUsQ0FBQyxDQUFBO1FBQ2pGLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUVBQW1FLENBQUMsQ0FBQTtRQUNqRixPQUFPLENBQUMsSUFBSSxDQUFDLGtFQUFrRSxDQUFDLENBQUE7UUFDaEYsT0FBTyxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFBO1FBQzNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDaEI7U0FBTTtRQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQTtLQUNqRDtBQUNILENBQUM7QUFYRCxvREFXQztBQUVELFNBQWdCLHVCQUF1QixDQUFDLEtBQWM7SUFDcEQsS0FBSyxNQUFNLEdBQUcsSUFBSSxtQ0FBZSxFQUFFO1FBQ2pDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdDLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtZQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLDBGQUEwRixDQUFDLENBQUE7WUFDeEcsT0FBTyxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsR0FBRyxtQ0FBbUMsQ0FBQyxDQUFBO1lBQ2hHLE9BQU8sQ0FBQyxJQUFJLENBQUMseUZBQXlGLENBQUMsQ0FBQTtZQUN2RyxPQUFPLENBQUMsSUFBSSxDQUFDLHlGQUF5RixDQUFDLENBQUE7WUFDdkcsT0FBTyxDQUFDLElBQUksQ0FBQywwRkFBMEYsQ0FBQyxDQUFBO1lBQ3hHLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEZBQTBGLENBQUMsQ0FBQTtZQUN4RyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyw0QkFBNEIsQ0FBQyxDQUFBO1lBQ3ZELE9BQU8sQ0FBQyxLQUFLLENBQUMsa0dBQWtHLENBQUMsQ0FBQTtZQUNqSCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ2hCO2FBQU07WUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixHQUFHLE9BQU8sT0FBTyxnQkFBZ0IsQ0FBQyxDQUFBO1NBQzFFO0tBQ0Y7QUFDSCxDQUFDO0FBakJELDBEQWlCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCBjb250ZXh0VGVtcGxhdGUgZnJvbSAnLi4vLi4vY2RrLmNvbnRleHQudGVtcGxhdGUuanNvbidcblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQWRtaW5FbWFpbFNldHVwKGFkbWluRW1haWw6IHN0cmluZykge1xuICBpZiAoYWRtaW5FbWFpbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc29sZS53YXJuKCcqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqJylcbiAgICBjb25zb2xlLndhcm4oJyoqKiDim5TvuI8gV0FSTklORzogWW91IG11c3QgcHJvdmlkZSBhIHZhbGlkIGFkbWluRW1haWwgYWRkcmVzcyAgICoqKicpXG4gICAgY29uc29sZS53YXJuKCcqKiogeW91IGNhbiBkbyB0aGlzIGJ5IGVkaXRpbmcgY2RrLmNvbnRleHQuanNvbiDwn5qAICAgICAgICAgICAgKioqJylcbiAgICBjb25zb2xlLndhcm4oJyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKionKVxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfm5EgTm8gYWRtaW5FbWFpbCBlbnRlcmVkLiBQbGVhc2UgdHJ5IGFnYWluJylcbiAgICBwcm9jZXNzLmV4aXQoMSlcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmluZm8oJ+KchSBTdWNjZXNzZnVsbHkgc2V0IHVwIGFkbWluRW1haWwnKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0NvbnRleHRGaWxlUHJlc2VudChzY29wZTogY2RrLkFwcCkge1xuICBmb3IgKGNvbnN0IGtleSBpbiBjb250ZXh0VGVtcGxhdGUpIHtcbiAgICBjb25zdCBjb250ZXh0ID0gc2NvcGUubm9kZS50cnlHZXRDb250ZXh0KGtleSlcbiAgICBpZiAoY29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zb2xlLndhcm4oJyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKionKVxuICAgICAgY29uc29sZS53YXJuKGAqKiog4puU77iPIFdBUk5JTkc6IFlvdSBtdXN0IHByb3ZpZGUgYSB2YWxpZCAke2tleX0gdmFsdWUgaW4gY2RrLmNvbnRleHQuanNvbiAqKioqKipgKVxuICAgICAgY29uc29sZS53YXJuKCcqKiog4p2TIERpZCB5b3UgbWFrZSBhIGNvcHkgb2YgY2RrLmNvbnRleHQudGVtcGxhdGUuanNvbj8gICAgICAgICAgICAgICAgICAgICoqKioqKioqKioqKicpXG4gICAgICBjb25zb2xlLndhcm4oJyoqKiDinZMgRGlkIHlvdSBmaWxsIGluIGFsbCB0aGUgcmVxdWlyZWQgdmFsdWVzIGZvciBjZGsgY29udGV4dD8gICAgICAgICAgICAgKioqKioqKioqKioqJylcbiAgICAgIGNvbnNvbGUud2FybignKioqIPCfkrsgeW91IGNhbiBkbyB0aGlzIGJ5IGVkaXRpbmcgY2RrLmNvbnRleHQuanNvbiDwn5qAICAgICAgICAgICAgICAgICAgICAgICAqKioqKioqKioqKionKVxuICAgICAgY29uc29sZS53YXJuKCcqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqJylcbiAgICAgIGNvbnNvbGUuZXJyb3IoYPCfm5EgTm8gJHtrZXl9IGVudGVyZWQuIFBsZWFzZSB0cnkgYWdhaW5gKVxuICAgICAgY29uc29sZS5lcnJvcihg8J+bkSBZb3UgbWF5IG5lZWQgdG8gY29weSBjZGsuY29udGV4dC50ZW1wbGF0ZS5qc29uIGFuZCByZW5hbWUgdGhlIGNvcGllZCBmaWxlIGFzIGNkay5jb250ZXh0Lmpzb25gKVxuICAgICAgcHJvY2Vzcy5leGl0KDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhg4pyFIFN1Y2Nlc3NmdWxseSBkZWZpbmVkICR7a2V5fSBhcyAke2NvbnRleHR9IGluIGNvbnRleHQg8J+OiWApXG4gICAgfVxuICB9XG59XG4iXX0=