import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface EvaluationsPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export default function EvaluationsPagination({
  currentPage,
  totalPages,
  total,
  perPage,
  onPageChange,
}: EvaluationsPaginationProps) {
  // Function to render page buttons with ellipses
  const renderPages = () => {
    let pages: (number | "...")[] = [];

    // Always show first page
    pages.push(1);

    // Insert ellipsis after first page if needed
    if (currentPage > 3) {
      pages.push("...");
    }

    // Show pages around current (currentPage - 1, currentPage, currentPage + 1)
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    // Insert ellipsis before last page if needed
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages.map((p, index) => {
      if (p === "...") {
        return (
          <PaginationItem key={index}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      return (
        <PaginationItem key={index}>
          <PaginationLink
            href="#"
            className={
              p === currentPage ? "bg-blue-400 text-white rounded-xl" : ""
            }
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Number(p));
            }}
          >
            {p}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = currentPage * perPage;

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full p-2 mt-4">
      <div className="text-sm text-gray-600">
        Showing {startIndex + 1} to {Math.min(endIndex, total)} of {total}{" "}
        records
      </div>
      <div>
        <Pagination>
          <PaginationContent>
            {/* PREVIOUS */}
            <PaginationItem>
              <PaginationPrevious
                className={`${
                  currentPage === 1
                    ? "hover:pointer-events-none bg-blue-100 opacity-50"
                    : "hover:bg-blue-400 bg-blue-200 "
                }`}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
              />
            </PaginationItem>

            {/* PAGE NUMBERS WITH ELLIPSES */}
            {renderPages()}

            {/* NEXT */}
            <PaginationItem>
              <PaginationNext
                className={`${
                  currentPage == totalPages
                    ? "hover:pointer-events-none bg-blue-100 opacity-50"
                    : "hover:bg-blue-400 bg-blue-200"
                }`}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
