"use client";

import { Download, Mail, ArrowLeft, Printer } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export interface GSTInvoiceData {
  id: string;
  invoiceNo: string;
  gstNumber: string;
  sacHsn: string;
  clientId: string;
  clientCode?: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientGSTID?: string;
  clientAddress: string;
  serviceDescription: string;
  packageDescription?: string;
  servicePeriodFrom: string;
  servicePeriodTo: string;
  date: string;
  status: "draft" | "sent" | "paid" | "overdue";
  amount: number;
  hours?: string;
  taxRate?: number;
  cgstRate: number;
  sgstRate: number;
  tdsApplicable?: boolean;
  tdsRate?: number;
  studioName: string;
  studioGSTNumber: string;
  studioAddress: string;
  studioPhone: string;
  studioWebsite: string;
  studioEmail: string;
  bankAccountHolder: string;
  bankAccountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId: string;
  // Multiple Services Support
  services?: Array<{
    serviceName: string;
    description?: string;
    amount: number;
  }>;
  // CC Email Support
  ccEmail1?: string;
  ccEmail2?: string;
  ccEmails?: string[];
  autoSend?: boolean;
}

interface SripadaInvoiceProps {
  invoice: GSTInvoiceData;
  onBack: () => void;
  onSendEmail: (invoiceNo: string) => void;
  onEdit?: (invoice: GSTInvoiceData) => Promise<void> | void;
}

interface ServiceRowLayout {
  index: number;
  serviceName: string;
  description: string;
  amount: number;
  estimatedHeight: number;
}

interface InvoicePageLayout {
  serviceRows: ServiceRowLayout[];
  includeTotals: boolean;
  includeFinalSection: boolean;
  showTable: boolean;
  isFinalPage: boolean;
}

export default function SripadaInvoice({
  invoice,
  onBack,
  onSendEmail,
  onEdit,
}: SripadaInvoiceProps) {
  const clients: any[] = [];
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  const filteredClients = useMemo(() => {
    if (!clientSearchTerm.trim()) return [];
    const term = clientSearchTerm.toLowerCase();
    return clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(term) ||
        (client.email || "").toLowerCase().includes(term) ||
        (client.phone || "").toLowerCase().includes(term) ||
        (client.clientCode || "").toLowerCase().includes(term)
      );
    });
  }, [clientSearchTerm, clients]);
  const formatSignatureTimestamp = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const tzMinutes = date.getTimezoneOffset();
    const sign = tzMinutes <= 0 ? "+" : "-";
    const offsetTotal = Math.abs(tzMinutes);
    const offsetHours = pad(Math.floor(offsetTotal / 60));
    const offsetMins = pad(offsetTotal % 60);

    return `${year}.${month}.${day}\n${hours}:${minutes}:${seconds} ${sign}${offsetHours}'${offsetMins}'`;
  };

  const [isSending, setIsSending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editData, setEditData] = useState<GSTInvoiceData>(invoice);
  const [signatureStamp, setSignatureStamp] = useState(() =>
    formatSignatureTimestamp(new Date()),
  );
  const accentColor = "#2f7c7c";
  const accentLight = "#eaf2f1";

  // Static footer/contact details (matches provided invoice design)
  const footerAddress =
    "No:4/2, 1st Floor, Chord Rd, Rajaji Nagar Industrial Town, Rajajinagar, Bengaluru, Karnataka 560 010";
  const footerWebsite = "www.nearbystudio.in";
  const footerEmail = "nearbystudiosocial@gmail.com";
  const footerPhone = "+91 9060870117";

  const parseDate = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDate = (value?: string, options?: Intl.DateTimeFormatOptions) => {
    const parsed = parseDate(value);
    if (!parsed) return "-";
    return parsed.toLocaleDateString(
      "en-IN",
      options || { day: "2-digit", month: "long", year: "numeric" },
    );
  };

  const getServiceMonthLabel = () => {
    const parsed = parseDate(editData.servicePeriodFrom);
    if (!parsed) return "";
    return parsed.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

  const getServicePeriodRange = () => {
    const from = parseDate(editData.servicePeriodFrom);
    const to = parseDate(editData.servicePeriodTo);

    if (from && to) {
      return `${from.toLocaleDateString("en-IN", { day: "2-digit", month: "long" })} to ${to.toLocaleDateString("en-IN", { day: "2-digit", month: "long" })}`;
    }
    if (from) {
      return from.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
      });
    }
    if (to) {
      return to.toLocaleDateString("en-IN", { day: "2-digit", month: "long" });
    }
    return "";
  };

  const defaultServiceDescription = getServicePeriodRange();

  // Calculate totals from services array or fallback to single service
  const getServicesData = () => {
    const taxRate = editData.taxRate || (editData.cgstRate + editData.sgstRate) || 0;
    const getBaseAmount = (amount: number) => {
      return taxRate > 0 ? amount / (1 + taxRate / 100) : amount;
    };

    if (editData.services && editData.services.length > 0) {
      return editData.services.map(s => ({
        ...s,
        amount: getBaseAmount(s.amount)
      }));
    }
    // Fallback to single service for backward compatibility
    const monthLabel = getServiceMonthLabel();
    const rangeLabel = defaultServiceDescription;
    const description = editData.packageDescription || [monthLabel, rangeLabel].filter(Boolean).join(" | ");
    return [
      {
        serviceName: editData.serviceDescription || "Studio Booking",
        description: description || "-",
        amount: getBaseAmount(editData.amount),
      },
    ];
  };

  const servicesData = getServicesData();
  const subtotalAmount = servicesData.reduce(
    (sum, service) => sum + service.amount,
    0,
  );

  const cgstAmount = (subtotalAmount * (editData.cgstRate || 0)) / 100;
  const sgstAmount = (subtotalAmount * (editData.sgstRate || 0)) / 100;
  const combinedGstAmount = (subtotalAmount * (editData.taxRate || 0)) / 100;

  const totalGST = editData.taxRate
    ? combinedGstAmount
    : cgstAmount + sgstAmount;

  // Final total should exactly match the sum of service amounts (inclusive of tax)
  const totalWithGST = subtotalAmount + totalGST;
  const tdsAmount = editData.tdsApplicable
    ? (subtotalAmount * (editData.tdsRate || 0)) / 100
    : 0;
  const totalAmount = totalWithGST - tdsAmount;

  const estimateServiceRowHeight = (
    serviceName: string,
    description: string,
  ) => {
    const safeName = (serviceName || "").trim();
    const safeDescription = (description || "").trim();
    const nameLines = Math.max(1, Math.ceil(safeName.length / 28));
    const descLines = safeDescription
      ? Math.max(1, Math.ceil(safeDescription.length / 44))
      : 1;
    return Math.max(46, 34 + (nameLines - 1) * 12 + (descLines - 1) * 12);
  };

  const invoicePages = useMemo<InvoicePageLayout[]>(() => {
    const PAGE_HEIGHT = 1122;
    const HEADER_BAR_HEIGHT = 116;
    const BASIC_INFO_BLOCK_HEIGHT = 170; // only page 1
    const TABLE_HEADER_HEIGHT = 46;
    const CONTENT_TOP_PADDING = 14;
    const CONTENT_BOTTOM_SAFE = 14;
    const BANK_WITH_ADDRESS_HEIGHT = 244;
    const BANK_TOP_GAP = 20;
    const TOTALS_HEIGHT = 166;
    const FINAL_SECTION_HEIGHT = 126;

    const topUsed = (pageIndex: number) =>
      HEADER_BAR_HEIGHT + (pageIndex === 0 ? BASIC_INFO_BLOCK_HEIGHT : 0);
    const nonFinalTableCapacity = (pageIndex: number) =>
      PAGE_HEIGHT -
      topUsed(pageIndex) -
      CONTENT_TOP_PADDING -
      CONTENT_BOTTOM_SAFE -
      TABLE_HEADER_HEIGHT;
    const finalTableCapacity = (pageIndex: number) =>
      nonFinalTableCapacity(pageIndex) -
      (BANK_WITH_ADDRESS_HEIGHT + BANK_TOP_GAP);
    const finalOnlyCapacity = (pageIndex: number) =>
      PAGE_HEIGHT -
      topUsed(pageIndex) -
      CONTENT_TOP_PADDING -
      CONTENT_BOTTOM_SAFE -
      (BANK_WITH_ADDRESS_HEIGHT + BANK_TOP_GAP);

    const rows: ServiceRowLayout[] = servicesData.map((service, index) => {
      const description = (
        service.description ||
        defaultServiceDescription ||
        ""
      ).trim();
      return {
        index: index + 1,
        serviceName: service.serviceName,
        description,
        amount: service.amount,
        estimatedHeight: estimateServiceRowHeight(
          service.serviceName,
          description,
        ),
      };
    });

    const pages: InvoicePageLayout[] = [];
    let currentRows: ServiceRowLayout[] = [];
    let currentHeight = 0;
    let splitPageIndex = 0;

    rows.forEach((row) => {
      const capacity = nonFinalTableCapacity(splitPageIndex);
      if (
        currentRows.length > 0 &&
        currentHeight + row.estimatedHeight > capacity
      ) {
        pages.push({
          serviceRows: currentRows,
          includeTotals: false,
          includeFinalSection: false,
          showTable: true,
          isFinalPage: false,
        });
        splitPageIndex += 1;
        currentRows = [];
        currentHeight = 0;
      }
      currentRows.push(row);
      currentHeight += row.estimatedHeight;
    });

    pages.push({
      serviceRows: currentRows,
      includeTotals: false,
      includeFinalSection: false,
      showTable: true,
      isFinalPage: false,
    });

    let totalsPageIndex = pages.length - 1;
    let totalsPageHeight = pages[totalsPageIndex].serviceRows.reduce(
      (sum, row) => sum + row.estimatedHeight,
      0,
    );
    if (
      totalsPageHeight + TOTALS_HEIGHT <=
      nonFinalTableCapacity(totalsPageIndex)
    ) {
      pages[totalsPageIndex].includeTotals = true;
      totalsPageHeight += TOTALS_HEIGHT;
    } else {
      pages.push({
        serviceRows: [],
        includeTotals: true,
        includeFinalSection: false,
        showTable: true,
        isFinalPage: false,
      });
      totalsPageIndex = pages.length - 1;
      totalsPageHeight = TOTALS_HEIGHT;
    }

    let finalPageIndex = totalsPageIndex;
    if (
      totalsPageHeight + FINAL_SECTION_HEIGHT <=
      finalTableCapacity(totalsPageIndex)
    ) {
      pages[totalsPageIndex].includeFinalSection = true;
    } else {
      pages.push({
        serviceRows: [],
        includeTotals: false,
        includeFinalSection: true,
        showTable: false,
        isFinalPage: false,
      });
      finalPageIndex = pages.length - 1;
    }

    const finalFits = pages[finalPageIndex].showTable
      ? totalsPageHeight + FINAL_SECTION_HEIGHT <=
        finalTableCapacity(finalPageIndex)
      : FINAL_SECTION_HEIGHT <= finalOnlyCapacity(finalPageIndex);

    if (!finalFits) {
      pages.push({
        serviceRows: [],
        includeTotals: false,
        includeFinalSection: true,
        showTable: false,
        isFinalPage: false,
      });
      finalPageIndex = pages.length - 1;
    }

    pages[finalPageIndex].isFinalPage = true;
    return pages;
  }, [servicesData, defaultServiceDescription]);

  const clientIdDisplay = editData.clientCode || editData.clientId;

  const formatCurrency = (value: number) => {
    return `₹ ${value.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const numberToWords = (num: number): string => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num === 0) return "Zero";
    if (num < 20) return ones[num];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] +
        (num % 10 !== 0 ? " " + ones[num % 10] : "")
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 !== 0 ? " " + numberToWords(num % 100) : "")
      );
    if (num < 100000)
      return (
        numberToWords(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 !== 0 ? " " + numberToWords(num % 1000) : "")
      );
    if (num < 10000000)
      return (
        numberToWords(Math.floor(num / 100000)) +
        " Lakh" +
        (num % 100000 !== 0 ? " " + numberToWords(num % 100000) : "")
      );
    return (
      numberToWords(Math.floor(num / 10000000)) +
      " Crore" +
      (num % 10000000 !== 0 ? " " + numberToWords(num % 10000000) : "")
    );
  };

  useEffect(() => {
    const tick = () => setSignatureStamp(formatSignatureTimestamp(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-send email if autoSend flag is present
  useEffect(() => {
    if (invoice.autoSend && !isSending) {
        handleSendEmail(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice.autoSend]);

  const [_signatureDatePart, _signatureTimePart] = signatureStamp.split("\n");

  const updateSignatureNow = () =>
    setSignatureStamp(formatSignatureTimestamp(new Date()));

  // Consistent text styles for header meta
  const headerLabelStyle = {
    color: accentColor,
    fontWeight: 800,
    fontSize: "13px",
  };
  const headerValueStyle = { fontWeight: 700, fontSize: "12px" };

  const generateInvoicePdfBlob = async (): Promise<Blob> => {
    const root = document.getElementById("invoice-print");
    if (!root) {
      throw new Error("Invoice element not found");
    }

    const pageElements = Array.from(
      root.querySelectorAll(".invoice-page"),
    ) as HTMLElement[];
    if (pageElements.length === 0) {
      throw new Error("Invoice pages not found");
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    for (let i = 0; i < pageElements.length; i += 1) {
      const pageElement = pageElements[i];
      const canvas = await html2canvas(pageElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: null,
      });

      const imageData = canvas.toDataURL("image/jpeg", 0.95);
      if (i > 0) {
        pdf.addPage("a4", "portrait");
      }
      pdf.addImage(imageData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
    }

    return pdf.output("blob");
  };

  const handleDownloadPDF = async () => {
    updateSignatureNow();
    try {
      const pdfBlob = await generateInvoicePdfBlob();
      const fileUrl = URL.createObjectURL(pdfBlob);
      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = `${editData.invoiceNo}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handlePrint = () => {
    updateSignatureNow();
    window.print();
  };

  const handleSendEmail = async (isAuto = false) => {
    const ccEmails: string[] = [];
    if (editData.ccEmail1) ccEmails.push(editData.ccEmail1);
    if (editData.ccEmail2) ccEmails.push(editData.ccEmail2);
    if (editData.ccEmails && Array.isArray(editData.ccEmails)) {
      ccEmails.push(
        ...editData.ccEmails.filter((email: string) => email && email.trim()),
      );
    }

    const allRecipients = [editData.clientEmail, ...ccEmails].filter(Boolean);
    const confirmMessage = `Send invoice with PDF to:\n\nMain: ${editData.clientEmail}${ccEmails.length > 0 ? `\n\nCC: ${ccEmails.join(", ")}` : ""}\n\nTotal recipients: ${allRecipients.length}`;

    if (!isAuto && !confirm(confirmMessage)) {
      return;
    }

    updateSignatureNow();
    setIsSending(true);
    try {
      console.log("[PDF] Starting PDF generation...");
      const startTime = Date.now();

      // Generate PDF with timeout
      const pdfBlob = (await Promise.race([
        generateInvoicePdfBlob(),
        new Promise(
          (_, reject) =>
            setTimeout(
              () => reject(new Error("PDF generation timeout")),
              30000,
            ), // 30 second timeout
        ),
      ])) as Blob;

      console.log(
        `[PDF] Generated in ${Date.now() - startTime}ms, size: ${pdfBlob.size} bytes`,
      );

      // Convert blob to base64 with timeout
      const reader = new FileReader();
      const pdfBase64 = await Promise.race([
        new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64data = reader.result as string;
            const base64 = base64data.split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(pdfBlob);
        }),
        new Promise<string>(
          (_, reject) =>
            setTimeout(
              () => reject(new Error("Base64 conversion timeout")),
              10000,
            ), // 10 second timeout
        ),
      ]);

      console.log(
        `[PDF] Base64 conversion completed, length: ${pdfBase64.length}`,
      );
      console.log("[EMAIL] Sending to:", editData.clientEmail);

      // Send email with timeout
      const token = localStorage.getItem("authToken");
      const response = await Promise.race([
        fetch(`${import.meta.env.VITE_API_URL}/api/send-invoice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            invoiceNo: editData.invoiceNo,
            clientEmail: editData.clientEmail,
            clientName: editData.clientName,
            invoice: {
              ...editData,
              // Include ALL CC emails - both ccEmail1/ccEmail2 and additional ones from ccEmails array
              ccEmail1: editData.ccEmail1,
              ccEmail2: editData.ccEmail2,
              ccEmails: editData.ccEmails || [],
            },
            pdfBase64,
          }),
        }),
        new Promise<Response>(
          (_, reject) =>
            setTimeout(() => reject(new Error("Email send timeout")), 60000), // 60 second timeout
        ),
      ]);

      console.log(
        `[EMAIL] API response: ${response.status} ${response.statusText}`,
      );
      const result = await response.json();

      if (response.ok) {
        console.log(`[EMAIL] Success! Total time: ${Date.now() - startTime}ms`);
        onSendEmail(editData.invoiceNo);
        if (!isAuto) {
          alert(`✓ Invoice sent successfully to ${allRecipients.length} recipient(s)`);
        }
      } else {
        console.error("[EMAIL] Failed:", result);
        alert(`Failed to send email: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("[EMAIL] Process failed:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      if (errorMsg.includes("timeout")) {
        if (!isAuto) alert("Email sending is taking longer than expected. Please try again or check your internet connection.");
      } else {
        if (!isAuto) alert(`Failed to send email: ${errorMsg}`);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!onEdit) {
      setIsEditing(false);
      return;
    }
    try {
      setIsSavingEdit(true);
      await onEdit(editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save invoice edits:", error);
      alert("Could not save changes. Please try again.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#327d7d] hover:text-[#265f5f] font-semibold transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="flex gap-3">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-sm font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm font-semibold"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition text-sm font-semibold"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  onClick={() => handleSendEmail(false)}
                  disabled={isSending}
                  className="flex items-center gap-2 px-4 py-2 bg-[#327d7d] text-white rounded hover:bg-[#265f5f] transition text-sm font-semibold disabled:opacity-50"
                >
                  <Mail size={16} />
                  {isSending ? "Sending..." : "Send Email"}
                </button>
              </>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(invoice);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm font-semibold"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Edit Form Modal */}
        {isEditing && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-[#327d7d] mb-4">
              {" "}
              Edit Invoice{" "}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {" "}
                  Invoice Number{" "}
                </label>
                <input
                  type="text"
                  value={editData.invoiceNo}
                  onChange={(e) =>
                    setEditData({ ...editData, invoiceNo: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">
                  {" "}
                  Client Name(Start typing to search){" "}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={clientSearchTerm || editData.clientName}
                    onChange={(e) => {
                      setClientSearchTerm(e.target.value);
                      setShowClientSuggestions(true);
                      setEditData({ ...editData, clientName: e.target.value });
                    }}
                    onFocus={() => setShowClientSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowClientSuggestions(false), 200)
                    }
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d]"
                    placeholder="Type to search existing clients..."
                  />
                  {showClientSuggestions && filteredClients.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredClients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setEditData({
                              ...editData,
                              clientId: client.id,
                              clientCode: client.clientCode,
                              clientName: client.name,
                              clientEmail: client.email,
                              clientPhone: client.phone || "",
                              clientGSTID: client.gstId || "",
                              clientAddress: client.address || "",
                              ccEmail1: client.ccEmail1 || "",
                              ccEmail2: client.ccEmail2 || "",
                              ccEmails: Array.isArray(client.ccEmails)
                                ? client.ccEmails
                                : [],
                            });
                            setClientSearchTerm("");
                            setShowClientSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                        >
                          <div className="font-semibold text-sm">
                            {" "}
                            {client.clientCode || "ID"} - {client.name}{" "}
                          </div>
                          <div className="text-xs text-gray-500">
                            {" "}
                            {client.email}{" "}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {" "}
                  Start typing to search and select an existing client.The
                  selected client details will be auto - filled.
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {" "}
                  Client Email{" "}
                </label>
                <input
                  type="email"
                  value={editData.clientEmail}
                  onChange={(e) =>
                    setEditData({ ...editData, clientEmail: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {" "}
                  Client Phone{" "}
                </label>
                <input
                  type="tel"
                  value={editData.clientPhone}
                  onChange={(e) =>
                    setEditData({ ...editData, clientPhone: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {" "}
                  Client GST ID{" "}
                </label>
                <input
                  type="text"
                  value={editData.clientGSTID || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, clientGSTID: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {" "}
                  Invoice Date{" "}
                </label>
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) =>
                    setEditData({ ...editData, date: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {" "}
                  Description(Optional){" "}
                </label>
                <textarea
                  value={editData.serviceDescription}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      serviceDescription: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d] resize-vertical"
                  placeholder="Press Enter for new line"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {" "}
                  Hours(Optional){" "}
                </label>
                <input
                  type="text"
                  value={editData.hours || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, hours: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d]"
                  placeholder="Leave empty if not applicable"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  {" "}
                  Tax Format{" "}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!editData.taxRate || editData.taxRate === 0}
                      onChange={() =>
                        setEditData({
                          ...editData,
                          taxRate: 0,
                          cgstRate: 9,
                          sgstRate: 9,
                        })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      {" "}
                      CGST 9 % + SGST 9 %{" "}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={editData.taxRate === 18}
                      onChange={() =>
                        setEditData({
                          ...editData,
                          taxRate: 18,
                          cgstRate: 0,
                          sgstRate: 0,
                        })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700"> GST 18 % </span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {" "}
                  CGST Rate(%){" "}
                </label>
                <input
                  type="number"
                  value={editData.cgstRate}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      cgstRate: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d]"
                  disabled={editData.taxRate === 18}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {" "}
                  SGST Rate(%){" "}
                </label>
                <input
                  type="number"
                  value={editData.sgstRate}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      sgstRate: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d]"
                  disabled={editData.taxRate === 18}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {" "}
                  GST Number{" "}
                </label>
                <input
                  type="text"
                  value={editData.gstNumber || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, gstNumber: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {" "}
                  SAC / HSN{" "}
                </label>
                <input
                  type="text"
                  value={editData.sacHsn || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, sacHsn: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d]"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    checked={editData.tdsApplicable || false}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        tdsApplicable: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    {" "}
                    TDS Applicable{" "}
                  </span>
                </label>
              </div>
              {editData.tdsApplicable && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {" "}
                    TDS Percentage *{" "}
                  </label>
                  <input
                    type="number"
                    value={editData.tdsRate || 0}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        tdsRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter TDS %"
                  />
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  {" "}
                  CC Emails(Optional){" "}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const allCCEmails: string[] = [];
                    if (editData.ccEmail1) allCCEmails.push(editData.ccEmail1);
                    if (editData.ccEmail2) allCCEmails.push(editData.ccEmail2);
                    if (editData.ccEmails && Array.isArray(editData.ccEmails)) {
                      allCCEmails.push(
                        ...editData.ccEmails.filter(
                          (e: string) => e && e.trim(),
                        ),
                      );
                    }
                    allCCEmails.push("");
                    setEditData({
                      ...editData,
                      ccEmail1: allCCEmails[0] || "",
                      ccEmail2: allCCEmails[1] || "",
                      ccEmails: allCCEmails.slice(2),
                    });
                  }}
                  className="text-sm bg-[#216974] text-white px-3 py-1 rounded hover:bg-[#184c55] transition"
                >
                  + Add CC Email
                </button>
              </div>
              {(() => {
                const allCCEmails: string[] = [];
                if (editData.ccEmail1) allCCEmails.push(editData.ccEmail1);
                if (editData.ccEmail2) allCCEmails.push(editData.ccEmail2);
                if (editData.ccEmails && Array.isArray(editData.ccEmails)) {
                  allCCEmails.push(
                    ...editData.ccEmails.filter((e: string) => e && e.trim()),
                  );
                }
                if (allCCEmails.length === 0) allCCEmails.push(""); // At least one field

                return allCCEmails.map((email, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const newEmails = [...allCCEmails];
                        newEmails[index] = e.target.value;
                        setEditData({
                          ...editData,
                          ccEmail1: newEmails[0] || "",
                          ccEmail2: newEmails[1] || "",
                          ccEmails: newEmails
                            .slice(2)
                            .filter((e) => e && e.trim()),
                        });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d]"
                      placeholder={`CC Email ${index + 1}`}
                    />
                    {allCCEmails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newEmails = allCCEmails.filter(
                            (_, i) => i !== index,
                          );
                          setEditData({
                            ...editData,
                            ccEmail1: newEmails[0] || "",
                            ccEmail2: newEmails[1] || "",
                            ccEmails: newEmails
                              .slice(2)
                              .filter((e) => e && e.trim()),
                          });
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ));
              })()}
            </div>
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700">
                {" "}
                Client Address{" "}
              </label>
              <textarea
                value={editData.clientAddress}
                onChange={(e) =>
                  setEditData({ ...editData, clientAddress: e.target.value })
                }
                rows={3}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#327d7d]"
              />
            </div>

            {/* MultipleServicesForm removed as it relies on missing component */}
          </div>
        )}

        {/* Invoice - A4 Multi-Page */}
        <div
          id="invoice-print"
          className="bg-white shadow-lg p-0"
          style={{
            width: "210mm",
            maxWidth: "100%",
            margin: "0 auto",
            backgroundColor: accentLight,
            border: "none",
            fontFamily: '"Poppins", Arial, sans-serif',
            color: "#1f2d2d",
            fontSize: "11px",
            lineHeight: 1.4,
            boxSizing: "border-box",
          }}
        >
          {invoicePages.map((page, pageIndex) => (
            <div key={`invoice-page-wrapper-${pageIndex}`}>
              <div
                className="invoice-page"
                style={{
                  width: "210mm",
                  maxWidth: "100%",
                  minHeight: "297mm",
                  backgroundColor: accentLight,
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                }}
              >
                {/* Top Bar */}
                <div
                  className="invoice-header"
                  style={{
                    backgroundColor: accentColor,
                    color: "#fff",
                    padding: "20px 36px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  <img
                    src="/invoice-logo.png"
                    alt="Sripada Studios Logo"
                    style={{
                      height: "65px",
                      width: "auto",
                      alignSelf: "center",
                    }}
                  />
                  <div
                    style={{ textAlign: "right", display: "grid", gap: "6px" }}
                  >
                    <div
                      style={{
                        fontSize: "36px",
                        fontWeight: 800,
                        letterSpacing: "0.6px",
                      }}
                    >
                      {" "}
                      INVOICE{" "}
                    </div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 600,
                        lineHeight: 1.5,
                      }}
                    >
                      <div>Studio GST: 29ABRCS9041A1Z2</div>
                      <div>Date: {format(new Date(), "d MMMM yyyy")}</div>
                      <div>SAC/HSN Code: {editData.sacHsn}</div>
                    </div>
                  </div>
                </div>

                {/* Basic Info - only first page */}
                {pageIndex === 0 && (
                  <div
                    style={{
                      padding: "20px 32px 16px",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      columnGap: "40px",
                      rowGap: "12px",
                      alignItems: "start",
                    }}
                  >
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={headerLabelStyle}> Invoice No </div>
                      <div style={headerValueStyle}> {editData.invoiceNo} </div>
                      <div style={headerLabelStyle}> Client ID </div>
                      <div style={headerValueStyle}> {clientIdDisplay} </div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#1f2d2d",
                          marginTop: "10px",
                        }}
                      >
                        {" "}
                        {editData.clientName}{" "}
                      </div>
                      <div style={{ whiteSpace: "pre-line" }}>
                        {" "}
                        {editData.clientAddress}{" "}
                      </div>
                      <div style={headerValueStyle}>
                        {" "}
                        {editData.clientPhone}{" "}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gap: "8px",
                        textAlign: "left",
                        alignItems: "start",
                      }}
                    >
                      <div style={headerLabelStyle}> Date </div>
                      <div style={headerValueStyle}>
                        {" "}
                        {formatDate(editData.date)}{" "}
                      </div>
                      <div style={headerLabelStyle}> GST ID / PAN </div>
                      <div style={headerValueStyle}>
                        {" "}
                        {editData.clientGSTID || "N/A"}{" "}
                      </div>
                      <div style={headerLabelStyle}> Email ID </div>
                      <div style={headerValueStyle}>
                        {" "}
                        {editData.clientEmail}{" "}
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    padding: "14px 24px 0",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    boxSizing: "border-box",
                  }}
                >
                  {/* Service Table */}
                  {page.showTable && (
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: "11px",
                          minWidth: "560px",
                          backgroundColor: "#fff",
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor: accentColor,
                              color: "#fff",
                            }}
                          >
                            {[
                              "SL NO",
                              "SERVICE NAME",
                              "DESCRIPTION",
                              "AMOUNT IN RUPEES",
                            ].map((h) => (
                              <th
                                key={h}
                                style={{
                                  border: "2px solid #111",
                                  padding: "10px",
                                  textAlign: "center",
                                  fontWeight: 700,
                                  fontSize: "11px",
                                  letterSpacing: "0.1px",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {page.serviceRows.map((row) => (
                            <tr
                              key={`service-row-${pageIndex}-${row.index}`}
                              style={{ backgroundColor: "#fff" }}
                            >
                              <td
                                style={{
                                  border: "2px solid #111",
                                  padding: "12px 10px",
                                  fontWeight: 700,
                                  textAlign: "center",
                                }}
                              >
                                {" "}
                                {row.index}{" "}
                              </td>
                              <td
                                style={{
                                  border: "2px solid #111",
                                  padding: "12px 10px",
                                }}
                              >
                                <div
                                  style={{ fontWeight: 700, fontSize: "12px" }}
                                >
                                  {" "}
                                  {row.serviceName}{" "}
                                </div>
                              </td>
                              <td
                                style={{
                                  border: "2px solid #111",
                                  padding: "12px 10px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "10px",
                                    color: "#4b5563",
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {" "}
                                  {row.description || "-"}{" "}
                                </div>
                              </td>
                              <td
                                style={{
                                  border: "2px solid #111",
                                  padding: "12px 10px",
                                  textAlign: "right",
                                  fontWeight: 700,
                                }}
                              >
                                {" "}
                                {formatCurrency(row.amount)}{" "}
                              </td>
                            </tr>
                          ))}

                          {page.includeTotals && (
                            <>
                              {editData.taxRate ? (
                                <tr>
                                  <td
                                    colSpan={3}
                                    style={{
                                      border: "2px solid #111",
                                      padding: "10px",
                                      fontWeight: 700,
                                    }}
                                  >
                                    GST {editData.taxRate || 0}%
                                  </td>
                                  <td
                                    style={{
                                      border: "2px solid #111",
                                      padding: "10px",
                                      textAlign: "right",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {" "}
                                    {formatCurrency(combinedGstAmount)}{" "}
                                  </td>
                                </tr>
                              ) : (
                                <>
                                  <tr>
                                    <td
                                      colSpan={3}
                                      style={{
                                        border: "2px solid #111",
                                        padding: "10px",
                                        fontWeight: 700,
                                      }}
                                    >
                                      CGST {editData.cgstRate || 0}%
                                    </td>
                                    <td
                                      style={{
                                        border: "2px solid #111",
                                        padding: "10px",
                                        textAlign: "right",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {" "}
                                      {formatCurrency(cgstAmount)}{" "}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      colSpan={3}
                                      style={{
                                        border: "2px solid #111",
                                        padding: "10px",
                                        fontWeight: 700,
                                      }}
                                    >
                                      SGST {editData.sgstRate || 0}%
                                    </td>
                                    <td
                                      style={{
                                        border: "2px solid #111",
                                        padding: "10px",
                                        textAlign: "right",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {" "}
                                      {formatCurrency(sgstAmount)}{" "}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      colSpan={3}
                                      style={{
                                        border: "2px solid #111",
                                        padding: "10px",
                                        fontWeight: 700,
                                        textAlign: "center",
                                      }}
                                    >
                                      {" "}
                                      Total GST{" "}
                                    </td>
                                    <td
                                      style={{
                                        border: "2px solid #111",
                                        padding: "10px",
                                        textAlign: "right",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {" "}
                                      {formatCurrency(totalGST)}{" "}
                                    </td>
                                  </tr>
                                </>
                              )}
                              {editData.tdsApplicable && (
                                <tr>
                                  <td
                                    colSpan={3}
                                    style={{
                                      border: "2px solid #111",
                                      padding: "10px",
                                      fontWeight: 700,
                                    }}
                                  >
                                    TDS Deduction {editData.tdsRate || 0}%
                                  </td>
                                  <td
                                    style={{
                                      border: "2px solid #111",
                                      padding: "10px",
                                      textAlign: "right",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {" "}
                                    - {formatCurrency(tdsAmount)}{" "}
                                  </td>
                                </tr>
                              )}
                              <tr
                                style={{
                                  backgroundColor: accentColor,
                                  color: "#fff",
                                }}
                              >
                                <td
                                  colSpan={3}
                                  style={{
                                    border: "2px solid #111",
                                    padding: "12px",
                                    fontWeight: 800,
                                    textAlign: "center",
                                    letterSpacing: "0.3px",
                                  }}
                                >
                                  {editData.tdsApplicable
                                    ? "NET AMOUNT PAYABLE"
                                    : "TOTAL AMOUNT IN RUPEES"}
                                </td>
                                <td
                                  style={{
                                    border: "2px solid #111",
                                    padding: "12px 14px",
                                    fontWeight: 800,
                                    textAlign: "right",
                                    letterSpacing: "0.1px",
                                  }}
                                >
                                  {formatCurrency(totalAmount)}
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Final grouped section */}
                  {page.includeFinalSection && (
                    <div
                      className="final-section"
                      style={{ marginTop: "14px", pageBreakInside: "avoid" }}
                    >
                      <div
                        style={{
                          padding: "0 24px",
                          fontSize: "18px",
                          fontWeight: 600,
                          color: accentColor,
                          textAlign: "left",
                        }}
                      >
                        {editData.tdsApplicable
                          ? "Net Amount Payable"
                          : "Total Amount"}{" "}
                        in Words : {numberToWords(Math.floor(totalAmount))} Only
                      </div>
                      {editData.tdsApplicable && (
                        <div
                          style={{
                            padding: "8px 24px",
                            fontSize: "12px",
                            color: "#4b5563",
                            textAlign: "left",
                          }}
                        >
                          Note: TDS of {formatCurrency(tdsAmount)} (
                          {editData.tdsRate || 0} %) has been deducted as per
                          Income Tax Act
                        </div>
                      )}
                      <div style={{ padding: "14px 36px 0" }}>
                        <div
                          style={{
                            borderTop: "1px solid #111",
                            borderBottom: "1px solid #111",
                            textAlign: "center",
                            padding: "10px 4px 8px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center"
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 800,
                              color: accentColor,
                              fontSize: "11px",
                              letterSpacing: "0.2px",
                              marginBottom: "8px"
                            }}
                          >
                            {" "}
                            THANK YOU FOR YOUR BUSINESS{" "}
                          </div>
                          <img 
                            src="/Nearby studio_white.webp" 
                            alt="Nearby Studio Logo" 
                            style={{ width: "120px", marginBottom: "4px" }} 
                          />
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#4b5563",
                              fontSize: "10px",
                              marginBottom: "6px"
                            }}
                          >
                            Thank you for choosing nearby studio
                          </div>
                          <div
                            style={{
                              color: "#4b5563",
                              fontSize: "9.5px",
                              marginTop: "3px",
                            }}
                          >
                            If you have any enquiries concerning this invoice,
                            please contact us.
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  <div style={{ flex: 1 }} />

                  {/* Bank block only on last page bottom */}
                  {page.isFinalPage && (
                    <>
                      <div
                        className="bank-footer"
                        style={{ marginTop: "20px" }}
                      >
                        <div style={{ padding: "12px 36px 12px" }}>
                          <div
                            style={{
                              border: "2px solid #111",
                              background: "#fff",
                              padding: "16px 18px",
                              display: "flex",
                              gap: "20px",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                display: "grid",
                                gap: "8px",
                                fontSize: "13px",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 800,
                                  color: "#111",
                                  fontSize: "14px",
                                  letterSpacing: "0.2px",
                                  marginBottom: "4px",
                                }}
                              >
                                {" "}
                                BANK ACCOUNT DETAILS{" "}
                              </div>
                              <div style={{ fontWeight: 600 }}>
                                {" "}
                                <strong>Account Holder Name: </strong> Nearby Studio
                                Private Limited
                              </div>
                              <div style={{ fontWeight: 600 }}>
                                {" "}
                                <strong>Account Number: </strong> 44797145260
                              </div>
                              <div style={{ fontWeight: 600 }}>
                                {" "}
                                <strong>Bank Name: </strong> State Bank of
                                India, Rajaji Nagar IND Estate
                              </div>
                              <div style={{ fontWeight: 600 }}>
                                {" "}
                                <strong>IFSC Code: </strong> SBIN0000762
                              </div>
                              <div style={{ fontWeight: 600 }}>
                                {" "}
                                <strong>UPI Id: </strong> nearbystudio5260@sbi
                              </div>
                            </div>
                            <div
                              style={{
                                minWidth: "120px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <img
                                src="/seal.png"
                                alt="Digital Seal"
                                style={{
                                  width: "120px",
                                  height: "120px",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="address-footer"
                        style={{
                          backgroundColor: accentColor,
                          color: "#fff",
                          textAlign: "center",
                          fontSize: "10px",
                          padding: "10px 16px",
                          lineHeight: 1.5,
                          marginTop: "4px",
                        }}
                      >
                        <div>
                          <strong>Address: </strong> {footerAddress}
                        </div>
                        <div>
                          <a
                            href={`https://${footerWebsite}`}
                            style={{
                              color: "#fff",
                              textDecoration: "underline",
                            }}
                          >
                            {footerWebsite}
                          </a>{" "}
                          |{" "}
                          <a
                            href={`mailto:${footerEmail}`}
                            style={{
                              color: "#fff",
                              textDecoration: "underline",
                            }}
                          >
                            {footerEmail}
                          </a>{" "}
                          | Phone: {footerPhone}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Email History section removed */}
      </div>

      {/* Print Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          html, body {
            width: 210mm;
            margin: 0;
            padding: 0;
            background: ${accentLight} !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: ${accentLight} !important;
            font-family: 'Poppins', Arial, sans-serif;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .min-h-screen {
            margin: 0;
            padding: 0;
            background: ${accentLight} !important;
            font-family: 'Poppins', Arial, sans-serif;
          }
          #invoice-print {
            box-shadow: none;
            margin: 0;
            padding: 0;
            width: 210mm;
            box-sizing: border-box;
            border: none;
            background: ${accentLight} !important;
          }
          .invoice-page {
            width: 210mm !important;
            min-height: 297mm !important;
            box-sizing: border-box !important;
            background: ${accentLight} !important;
            display: flex !important;
            flex-direction: column !important;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .invoice-header {
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          .final-section,
          .bank-footer,
          .address-footer {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          button {
            display: none !important;
          }
        }
        @media screen {
          #invoice-print,
          .invoice-page {
            background: ${accentLight} !important;
          }
        }
      `}</style>
    </div>
  );
}
