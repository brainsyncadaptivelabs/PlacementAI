package com.aiplacement.backend.dto.dashboard;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDto implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String company;
    private String type;
    private String date;
    private String time;
    private String color;
}
