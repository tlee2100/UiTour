namespace UITour.Models.DTO
{
    public class HostDashboardDto
    {
        public decimal[] YearlyStay { get; set; } = new decimal[12];
        public decimal[] YearlyExp { get; set; } = new decimal[12];

        public decimal TotalIncomeYTD { get; set; }
        public decimal TotalIncomeYTDChange { get; set; }

        public decimal IncomeThisMonth { get; set; }
        public decimal IncomeThisMonthChange { get; set; }

        public int BookingsThisMonth { get; set; }
        public int BookingsThisMonthChange { get; set; }

        public int UpcomingBookings { get; set; }
    }

}
