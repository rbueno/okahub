interface IPaging {
    totalItems: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
    previousPage: number | null
    nextPage: number | null
}

interface IPaginParams {
  itemsPerPage?: number
  totalItems?: number
  page?: number
}
  
  const isInteger = (number: number | undefined) => {
    if (!number) return false
    if (isNaN(number) || (typeof number !== 'number' && typeof number !== 'string')) return false
    return true
  }
  
  const ensureIntegerPage = ({ itemsPerPage, page, totalItems }: IPaginParams) => {
    if (!isInteger(itemsPerPage) || !isInteger(page))
      return { validItemsPerPageInteger: 10, validPageInteger: 1, validTotalItemsInteger: 0 }
    return {
      validItemsPerPageInteger: Number(itemsPerPage),
      validPageInteger: Number(page),
      validTotalItemsInteger: Number(totalItems)
    }
  }
  

  export const createPagination = (paginParams: IPaginParams): IPaging => {
    const { itemsPerPage = 10, totalItems = 0, page = 1 } = paginParams
  
    const { validItemsPerPageInteger, validPageInteger, validTotalItemsInteger } = ensureIntegerPage({
      itemsPerPage,
      page,
      totalItems
    })
  
    const totalPages = Math.ceil(validTotalItemsInteger / validItemsPerPageInteger)
  
    let validPage = validPageInteger > totalPages ? totalPages : validPageInteger
    if (validPage < 1) validPage = 1
  
    return {
      itemsPerPage: validItemsPerPageInteger,
      nextPage: validPage < totalPages ? validPage + 1 : null,
      currentPage: validPage,
      previousPage: validPage > 1 ? validPage - 1 : null,
      totalPages,
      totalItems: validTotalItemsInteger
    }
  }
