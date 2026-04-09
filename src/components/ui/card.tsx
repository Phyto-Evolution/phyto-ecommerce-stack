interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={["mb-4", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

function CardTitle({ children, className = "" }: CardTitleProps) {
  return (
    <h3
      className={[
        "text-lg font-semibold text-gray-900",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </h3>
  );
}

export { Card, CardHeader, CardTitle };
export type { CardProps, CardHeaderProps, CardTitleProps };
