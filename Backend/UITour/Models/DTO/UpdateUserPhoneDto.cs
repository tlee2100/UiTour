using System.ComponentModel.DataAnnotations;

public class UpdateUserPhoneDto
{
    [Required] [StringLength(20)] 
    public string NewPhone { get; set; }
    
}
