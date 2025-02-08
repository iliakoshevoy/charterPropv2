// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as PPTX from 'pptxgenjs';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const template = formData.get('template') as File;
    const customerName = formData.get('customerName') as string;
    const image = formData.get('image') as File;

    // Read the template file
    const templateBuffer = await template.arrayBuffer();
    
    // Create a new presentation
    const pres = new PPTX.default();
    
    // Add a slide
    const slide = pres.addSlide();
    
    // Add text with placeholder
    slide.addText(customerName, {
      x: 1,
      y: 1,
      w: '50%',
      h: 1,
      fontSize: 24
    });

    // If image was uploaded, add it
    if (image) {
      const imageBuffer = await image.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      
      slide.addImage({
        data: `data:image/${image.type};base64,${base64Image}`,
        x: 1,
        y: 2,
        w: 4,
        h: 3
      });
    }

    // Generate PowerPoint as buffer
    const pptxBuffer = await pres.write('nodebuffer');

    // Convert to PDF using Puppeteer
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Load PowerPoint in browser and convert to PDF
    // Note: This is a simplified version. In production, you'd need a more robust
    // PowerPoint to PDF conversion solution
    
    await browser.close();

    // For now, we'll just return the PowerPoint file
    return new NextResponse(pptxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': 'attachment; filename=generated.pptx'
      }
    });

  } catch (error) {
    console.error('Error processing PowerPoint:', error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}
