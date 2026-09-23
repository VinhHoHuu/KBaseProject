package vinhhhse203194.fpt.academy.first_homework.service;

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Service trích xuất text từ các loại file lưu trên MinIO.
 * Hỗ trợ: PDF, DOCX, XLSX, PPTX, TXT, MD
 */
@Service
public class DocumentTextExtractor {

    @Autowired
    private MinioClient minioClient;

    @Value("${minio.bucket.name}")
    private String bucketName;

    /**
     * Trích xuất text từ file dựa trên fileKey và loại file.
     * @param fileKey tên file trên MinIO (uuid.ext)
     * @param contentType MIME type (vd: application/pdf)
     * @return nội dung text của file
     */
    public String extractText(String fileKey, String contentType) {
        try {
            // Download file từ MinIO
            InputStream inputStream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileKey)
                            .build()
            );

            String extension = fileKey.substring(fileKey.lastIndexOf(".") + 1).toLowerCase();

            return switch (extension) {
                case "pdf" -> extractFromPdf(inputStream);
                case "docx" -> extractFromDocx(inputStream);
                case "xlsx", "xls" -> extractFromXlsx(inputStream);
                case "pptx", "ppt" -> extractFromPptx(inputStream);
                case "txt", "md", "csv" -> extractFromText(inputStream);
                default -> "[Không hỗ trợ trích xuất text từ định dạng: " + extension + "]";
            };
        } catch (Exception e) {
            return "[Lỗi khi trích xuất text: " + e.getMessage() + "]";
        }
    }

    // Đọc text từ PDF dùng Apache PDFBox
    private String extractFromPdf(InputStream is) throws Exception {
        byte[] bytes = readAllBytes(is);
        try (PDDocument document = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    // Đọc text từ DOCX dùng Apache POI
    private String extractFromDocx(InputStream is) throws Exception {
        try (XWPFDocument document = new XWPFDocument(is)) {
            StringBuilder sb = new StringBuilder();
            for (XWPFParagraph para : document.getParagraphs()) {
                sb.append(para.getText()).append("\n");
            }
            return sb.toString();
        }
    }

    // Đọc text từ XLSX dùng Apache POI
    private String extractFromXlsx(InputStream is) throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook(is)) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                XSSFSheet sheet = workbook.getSheetAt(i);
                sb.append("--- Sheet: ").append(sheet.getSheetName()).append(" ---\n");
                for (int r = 0; r <= sheet.getLastRowNum(); r++) {
                    XSSFRow row = sheet.getRow(r);
                    if (row == null) continue;
                    for (int c = 0; c < row.getLastCellNum(); c++) {
                        XSSFCell cell = row.getCell(c);
                        if (cell != null) {
                            sb.append(cell.toString()).append("\t");
                        }
                    }
                    sb.append("\n");
                }
            }
            return sb.toString();
        }
    }

    // Đọc text từ PPTX dùng Apache POI
    private String extractFromPptx(InputStream is) throws Exception {
        try (XMLSlideShow ppt = new XMLSlideShow(is)) {
            StringBuilder sb = new StringBuilder();
            int slideNum = 1;
            for (XSLFSlide slide : ppt.getSlides()) {
                sb.append("--- Slide ").append(slideNum++).append(" ---\n");
                for (XSLFShape shape : slide.getShapes()) {
                    if (shape instanceof XSLFTextShape textShape) {
                        sb.append(textShape.getText()).append("\n");
                    }
                }
            }
            return sb.toString();
        }
    }

    // Đọc text từ TXT, MD, CSV
    private String extractFromText(InputStream is) throws Exception {
        byte[] bytes = readAllBytes(is);
        return new String(bytes, StandardCharsets.UTF_8);
    }

    // Helper: đọc toàn bộ bytes từ InputStream
    private byte[] readAllBytes(InputStream is) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] data = new byte[8192];
        int bytesRead;
        while ((bytesRead = is.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, bytesRead);
        }
        return buffer.toByteArray();
    }
}
