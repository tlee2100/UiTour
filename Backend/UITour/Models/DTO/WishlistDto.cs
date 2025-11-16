namespace UITour.Models.DTO
{
    public class WishlistItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Type { get; set; } = "property";
    }

    public class WishlistDto
    {
        public string Id { get; set; } = "default";
        public string Title { get; set; } = "Danh sách yêu thích";
        public string Cover { get; set; } = string.Empty;
        public int ItemsCount { get; set; }
        public List<WishlistItemDto> Items { get; set; } = new List<WishlistItemDto>();
    }
}

