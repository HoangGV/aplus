import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4169E1] transition-colors hover:text-[#3457C8] dark:text-[#9EB4FA] dark:hover:text-[#C4D1FD]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Quay lại công cụ tính CPA &amp; GPA</span>
        </Link>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold text-[#4169E1] dark:text-[#6F8FF2]">
          Aplus | Người đồng hành
        </p>
        <h1
          className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white"
          style={{ textWrap: "balance" }}
        >
          Giới thiệu về Aplus
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Điểm số chỉ có thể tốt hơn
        </p>

        <div className="mt-6 space-y-6 border-t border-slate-200 pt-6 text-sm leading-relaxed text-slate-700 sm:text-base dark:border-slate-800 dark:text-slate-300">
          <p>
            Đây là trang chia sẻ{" "}
            <strong className="font-semibold text-slate-900 dark:text-white">
              Tài liệu số
            </strong>{" "}
            và trao đổi{" "}
            <strong className="font-semibold text-slate-900 dark:text-white">
              Giáo trình
            </strong>{" "}
            học tập, đồng thời cung cấp công cụ tính toán CPA, GPA và lập kế
            hoạch cải thiện điểm số dành cho sinh viên.
          </p>

          <section className="space-y-2.5">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg dark:text-white">
              1. Tài liệu số
            </h2>
            <p>
              Bao gồm những tệp tài liệu học tập như PDF, Word, PowerPoint,...
            </p>
            <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-300">
              <li>
                Đây có thể là những tài liệu hay mà bạn sưu tầm được và muốn
                chia sẻ để mọi người cùng tiếp cận.
              </li>
              <li>
                Hoặc là nơi các bạn chia sẻ các tài liệu đọc thử và bản hoàn
                thiện hỗ trợ quá trình học tập, ôn thi.
              </li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400">
              Mong muốn nhận được sự quan tâm và đóng góp của các bạn vào kho
              tàng tri thức chung này.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg dark:text-white">
              2. Giáo trình &amp; Bài viết học thuật
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-300">
              <li>
                Kết nối các bạn có nhu cầu chia sẻ giáo trình cũ với những bạn
                đang tìm kiếm giáo trình phục vụ môn học.
              </li>
              <li>
                Hỗ trợ đăng tải bài viết, chia sẻ kinh nghiệm học tập và tổng
                hợp học liệu số thuận tiện.
              </li>
            </ul>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg dark:text-white">
              3. Công cụ tính CPA, GPA &amp; Kế hoạch cải thiện điểm
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Hỗ trợ đọc trực tiếp tệp bảng điểm, linh hoạt chuyển đổi giữa các
              thang điểm hệ 4, đặt mục tiêu xếp loại bằng tốt nghiệp và mô phỏng
              điểm cải thiện cho các học phần dưới điểm B.
            </p>
          </section>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
            <Link
              to="/"
              className="inline-flex min-h-[42px] items-center rounded-lg bg-[#4169E1] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3457C8]"
            >
              Mở công cụ tính CPA &amp; GPA
            </Link>
            <a
              href="https://cms.ndh.io.vn/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <span>Tạo bài viết</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
            </a>
            <a
              href="https://docs.ndh.io.vn/chia-se"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <span>Chia sẻ tài liệu</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}
