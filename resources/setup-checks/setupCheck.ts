import * as cdk from 'aws-cdk-lib'
import contextTemplate from '../../cdk.context.template.json'

export function checkAdminEmailSetup(adminEmail: string) {
  if (adminEmail === undefined) {
    console.warn('****************************************************************')
    console.warn('*** ⛔️ WARNING: You must provide a valid adminEmail address   ***')
    console.warn('*** you can do this by editing cdk.context.json 🚀            ***')
    console.warn('****************************************************************')
    console.error('🛑 No adminEmail entered. Please try again')
    process.exit(1)
  } else {
    console.info('✅ Successfully set up adminEmail')
  }
}

export function checkContextFilePresent(scope: cdk.App) {
  for (const key in contextTemplate) {
    const context = scope.node.tryGetContext(key)
    if (context === undefined) {
      console.warn('****************************************************************************************')
      console.warn(`*** ⛔️ WARNING: You must provide a valid ${key} value in cdk.context.json ******`)
      console.warn('*** ❓ Did you make a copy of cdk.context.template.json?                    ************')
      console.warn('*** ❓ Did you fill in all the required values for cdk context?             ************')
      console.warn('*** 💻 you can do this by editing cdk.context.json 🚀                       ************')
      console.warn('****************************************************************************************')
      console.error(`🛑 No ${key} entered. Please try again`)
      console.error(`🛑 You may need to copy cdk.context.template.json and rename the copied file as cdk.context.json`)
      process.exit(1)
    } else {
      console.info(`✅ Successfully defined ${key} as ${context} in context 🎉`)
    }
  }
}
