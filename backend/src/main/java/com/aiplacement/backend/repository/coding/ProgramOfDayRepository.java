package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.coding.ProgramOfDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ProgramOfDayRepository extends JpaRepository<ProgramOfDay, Long> {

    Optional<ProgramOfDay> findByUserAndAssignedDate(User user, LocalDate assignedDate);

    Optional<ProgramOfDay> findByUserIdAndAssignedDate(Long userId, LocalDate assignedDate);

    List<ProgramOfDay> findByUserOrderByAssignedDateDesc(User user);

    @Query("SELECT p.codingProblem.id FROM ProgramOfDay p WHERE p.user.id = :userId")
    List<Long> findAssignedProblemIdsByUserId(@Param("userId") Long userId);
}
