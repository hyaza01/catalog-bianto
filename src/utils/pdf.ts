import { jsPDF } from 'jspdf'
import { CATEGORY_LABELS } from '../types/product'
import type { SelectionItemDetailed } from '../types/selection'
import { formatBRL, formatDateForFile, formatDatePtBr } from './format'

const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Não foi possível converter a imagem para base64.'))
    }

    reader.onerror = () => {
      reject(new Error('Falha ao ler o arquivo de imagem.'))
    }

    reader.readAsDataURL(blob)
  })
}

const loadImageAsDataUrl = async (imageUrl: string): Promise<string | null> => {
  if (!imageUrl.trim()) {
    return null
  }

  try {
    const response = await fetch(imageUrl, {
      mode: 'cors',
      cache: 'force-cache',
    })

    if (!response.ok) {
      return null
    }

    const imageBlob = await response.blob()
    return await blobToDataUrl(imageBlob)
  } catch {
    return null
  }
}

const drawImageSlot = (
  doc: jsPDF,
  imageDataUrl: string | null,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(x, y, width, height, 2, 2, 'S')

  if (!imageDataUrl) {
    doc.setFillColor(241, 245, 249)
    doc.roundedRect(x + 0.5, y + 0.5, width - 1, height - 1, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(8)
    doc.text('Imagem', x + width / 2, y + height / 2 - 1, { align: 'center' })
    doc.text('indisponível', x + width / 2, y + height / 2 + 3, { align: 'center' })
    return
  }

  const format = imageDataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'

  try {
    doc.addImage(imageDataUrl, format, x + 0.8, y + 0.8, width - 1.6, height - 1.6)
  } catch {
    doc.setFillColor(241, 245, 249)
    doc.roundedRect(x + 0.5, y + 0.5, width - 1, height - 1, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(8)
    doc.text('Erro na', x + width / 2, y + height / 2 - 1, { align: 'center' })
    doc.text('imagem', x + width / 2, y + height / 2 + 3, { align: 'center' })
  }
}

const measureCardHeight = (doc: jsPDF, item: SelectionItemDetailed, contentWidth: number, cardWidth: number) => {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  const titleLines = doc.splitTextToSize(item.product.name, contentWidth)

  const noteValue = item.note.trim().length > 0 ? item.note.trim() : 'Sem observação.'
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  const noteLines = doc.splitTextToSize(noteValue, cardWidth - 16)

  const textBlockHeight = titleLines.length * 5 + 12
  const imageBlockHeight = 30
  const headAreaHeight = Math.max(imageBlockHeight, textBlockHeight)
  const noteAreaHeight = 8 + noteLines.length * 4

  return {
    titleLines,
    noteLines,
    cardHeight: 8 + headAreaHeight + 4 + noteAreaHeight + 4,
    headAreaHeight,
  }
}

export const exportSelectionToPdf = async (items: SelectionItemDetailed[]): Promise<void> => {
  if (items.length === 0) {
    return
  }

  const now = new Date()
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 12
  const cardGap = 5

  doc.setTextColor(26, 26, 46)
  doc.setFontSize(20)
  doc.text('Bianto Store', margin, 18)

  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text(`Data de geração: ${formatDatePtBr(now)}`, margin, 25)
  doc.text('Preview visual da seleção', margin, 30)

  const imageCache = new Map<string, string | null>()
  const cardX = margin
  const cardWidth = pageWidth - margin * 2
  const imageXOffset = 4
  const imageYOffset = 4
  const imageWidth = 40
  const imageHeight = 30
  const textXOffset = imageXOffset + imageWidth + 4
  const textWidth = cardWidth - textXOffset - 4

  let cursorY = 36

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    const { titleLines, noteLines, cardHeight, headAreaHeight } = measureCardHeight(doc, item, textWidth, cardWidth)

    if (cursorY + cardHeight > pageHeight - margin - 20) {
      doc.addPage()
      cursorY = margin
    }

    doc.setDrawColor(203, 213, 225)
    doc.roundedRect(cardX, cursorY, cardWidth, cardHeight, 3, 3, 'S')

    doc.setFillColor(26, 26, 46)
    doc.roundedRect(cardX, cursorY, cardWidth, 8, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(255, 255, 255)
    doc.text(`Item ${index + 1}`, cardX + 4, cursorY + 5.4)

    const imageX = cardX + imageXOffset
    const imageY = cursorY + imageYOffset + 6
    const contentX = cardX + textXOffset
    const contentY = cursorY + imageYOffset + 10

    const imageUrl = item.product.images[0] || ''
    let imageData = imageCache.get(imageUrl)

    if (imageData === undefined) {
      imageData = await loadImageAsDataUrl(imageUrl)
      imageCache.set(imageUrl, imageData)
    }

    drawImageSlot(doc, imageData, imageX, imageY, imageWidth, imageHeight)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(26, 26, 46)
    doc.text(titleLines, contentX, contentY)

    const categoryLabel = item.product.categoryName || CATEGORY_LABELS[item.product.category]
    const metaLine = `${categoryLabel} | Qtd: ${item.quantity} | Min: ${item.product.minQuantity}`

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(71, 85, 105)
    doc.text(metaLine, contentX, contentY + titleLines.length * 5 + 1)

    doc.setFont('courier', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(233, 69, 96)
    doc.text(`${formatBRL(item.product.price)} por unidade`, contentX, contentY + titleLines.length * 5 + 6.2)

    const noteY = cursorY + 8 + headAreaHeight + 4
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(cardX + 3, noteY, cardWidth - 6, cardHeight - (noteY - cursorY) - 3, 2, 2, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(71, 85, 105)
    doc.text('Observação', cardX + 6, noteY + 4)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(51, 65, 85)
    doc.text(noteLines, cardX + 6, noteY + 8)

    cursorY += cardHeight + cardGap
  }

  const totalQuantity = items.reduce((accumulator, item) => accumulator + item.quantity, 0)
  const estimatedTotal = items.reduce((accumulator, item) => accumulator + item.quantity * item.product.price, 0)

  if (cursorY + 20 > pageHeight - margin) {
    doc.addPage()
    cursorY = margin
  }

  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(cardX, cursorY, cardWidth, 16, 3, 3, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(26, 26, 46)
  doc.setFontSize(9.5)
  doc.text(`Resumo: ${items.length} item(ns) | Quantidade total: ${totalQuantity}`, cardX + 4, cursorY + 6)
  doc.setFont('courier', 'bold')
  doc.setTextColor(233, 69, 96)
  doc.text(`Estimativa total: ${formatBRL(estimatedTotal)}`, cardX + 4, cursorY + 12)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.setFontSize(8)
  doc.text('Envie este PDF no WhatsApp para acelerar seu atendimento.', cardX, pageHeight - 8)

  const filename = `bianto-store-selecao-${formatDateForFile(now)}.pdf`
  doc.save(filename)
}
