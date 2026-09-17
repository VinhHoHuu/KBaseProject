package vinhhhse203194.fpt.academy.first_homework.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import vinhhhse203194.fpt.academy.first_homework.entity.Project;

public interface IProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

}
