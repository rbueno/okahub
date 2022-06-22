import axios from 'axios'
import { apiReferences } from '../../integrations/provi/settings'

interface SettingsDataDTO {
    apiToken: string
}


export const createPlatformAPI: any = {
    provi: (settingsData: SettingsDataDTO) => {
        console.log('==== createPlatformAPI settingsData.apiToken', settingsData.apiToken)
        return axios.create({ baseURL: apiReferences.baseURL.development, timeout: 20000, headers: { 'api-token': settingsData.apiToken } })
    }
}
