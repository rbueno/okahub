import { Deals, ActivityLogs } from '../../../models'

const activityLogType = {
  dealCreated: 'dealCreated',
  dealUpdated: 'dealUpdated',
  noteCreated: 'noteCreated'
}

const createOrUpdateDeal = async (businessId: string, incomeDeal: any): Promise<any> => {

    const currentDeal: any = await Deals.findOne({ order: incomeDeal.order, businessId })

    const dealOwnerConfig = {
        // deal chegar sem dono, usuário clica e vira dono do deal
        // deal chegar sem dono, apenas admin pode vincular deal com usuários
        // 
        // deal chegar e de acordo com certa propriedade buscar uma conexão da propriedade com um usuário.
    }

      let hasNewField = false

      if (currentDeal) {
          console.log('atualizando current deal')
          for (const key in incomeDeal) {
              console.log(`checando dado: ${key}`)
              if (typeof incomeDeal[key] !== 'string') continue
              if (currentDeal[key] !== incomeDeal[key]) {
                  console.log(`novo dado: ${key}`,  currentDeal[key], incomeDeal[key])
                  currentDeal[key] = incomeDeal[key]
                  hasNewField = true
              } else {
                  console.log(`dado não mudou: ${key}`,  currentDeal[key], incomeDeal[key])
              }
          }

          console.log('hasNewField =====> ',hasNewField)
          if (hasNewField) {
              // await currentDeal.save()
              console.log('atualizado')
            await ActivityLogs.create({
              type: activityLogType.dealUpdated,
              title: 'Deal atualizado',
              description: 'O deal foi atualizado',
              dealId: currentDeal._id,
              businessId
            })
            return { message: 'Deal atualizado'}
          }
          return { message: 'Deal não teve update'}
          
      }

      console.log('Criando novo deal')
      const createdDeal = await Deals.create(incomeDeal)
      console.log('Criado')
      await ActivityLogs.create({
        type: activityLogType.dealCreated,
        title: 'Deal criado',
        description: 'Um novo deal foi criado',
        dealId: createdDeal._id,
        businessId
      })
      
      return { message: 'Deal criado'}
}

export { createOrUpdateDeal }