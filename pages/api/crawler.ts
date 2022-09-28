import puppeteer from 'puppeteer';
import { NextApiRequest, NextApiResponse } from 'next';

enum ExportType {
  Image = 'image',
  Pdf = 'pdf',
}

interface CrawlerProcessParams {
  type: ExportType | string;
  url: string;
}

const process = async ({ url, type }: CrawlerProcessParams) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url || 'https://example.com');
  if (type === ExportType.Pdf) {
    const pdfBuffer = await page.pdf({ format: 'a4' });
    await browser.close();
    return pdfBuffer;
  }
  const screenshotBuffer = await page.screenshot({});
  await browser.close();
  return screenshotBuffer;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | Buffer>
) {
  const type = String(req.query.type || '');
  const url = String(req.query.url || '');
  process({ type: type || ExportType.Image, url }).then((buffer) => {
    if (type === ExportType.Pdf) {
      res.setHeader('Content-Type', 'application/pdf');
    } else {
      res.setHeader('Content-Type', 'image/png');
    }
    res.status(200).send(buffer);
  });
}
