using System.ComponentModel.DataAnnotations;

public class UpdateUserProfileDto
{
    [StringLength(200)] public string FullName { get; set; }
    [StringLength(20)] public string Phone { get; set; }
    public string UserAbout { get; set; }
    public int? Age { get; set; }
    [StringLength(20)] public string Gender { get; set; }
    [StringLength(100)] public string Nationality { get; set; }
    public string Interests { get; set; }
}
