package ca.mcgill.ecse321.GameShop.service;

import ca.mcgill.ecse321.GameShop.exception.GameShopException;
import ca.mcgill.ecse321.GameShop.model.CustomerOrder;
import ca.mcgill.ecse321.GameShop.model.CustomerAccount;
import ca.mcgill.ecse321.GameShop.model.PaymentDetails;
import ca.mcgill.ecse321.GameShop.model.Game;
import ca.mcgill.ecse321.GameShop.model.OrderGame;
import ca.mcgill.ecse321.GameShop.repository.CustomerOrderRepository;
import ca.mcgill.ecse321.GameShop.repository.CustomerAccountRepository;
import ca.mcgill.ecse321.GameShop.repository.PaymentDetailsRepository;
import ca.mcgill.ecse321.GameShop.repository.GameRepository;
import ca.mcgill.ecse321.GameShop.repository.OrderGameRepository;
import ca.mcgill.ecse321.GameShop.dto.CustomerOrderResponseDto;
import ca.mcgill.ecse321.GameShop.dto.CustomerOrderRequestDto;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.sql.Date;
import java.util.ArrayList;

@Service
public class CustomerOrderService {

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private CustomerAccountRepository customerAccountRepository;

    @Autowired
    private PaymentDetailsRepository paymentDetailsRepository;

    @Autowired
    private OrderGameRepository orderGameRepository;

    /**
     * create a customer order
     * @param requestDto 
     * @return CustomerOrder 
     * @throws GameShopException
     */
    @Transactional
    public CustomerOrder createCustomerOrder(CustomerOrderRequestDto requestDto) {
        CustomerAccount orderedBy = customerAccountRepository.findCustomerAccountByCustomerId(requestDto.getOrderedById());
        PaymentDetails paymentInformation = paymentDetailsRepository.findPaymentDetailsByPaymentDetailsId(requestDto.getPaymentInformationId());
        Date orderDate = requestDto.getOrderDate();

        if (orderedBy == null) {
            throw new GameShopException(HttpStatus.NOT_FOUND, "Customer not found");
        }

        if (paymentInformation == null) {
            throw new GameShopException(HttpStatus.NOT_FOUND, "Payment information not found");
        }

        if (orderDate == null) {
            throw new GameShopException(HttpStatus.BAD_REQUEST, "Order date is required");
        }

        CustomerOrder order = new CustomerOrder(orderDate, orderedBy, paymentInformation);

        // add ordered games
        for (int gameId : requestDto.getOrderedGameIds()) {
            OrderGame game = orderGameRepository.findOrderGameById(gameId);
            if (game == null) {
                throw new GameShopException(HttpStatus.NOT_FOUND, "Game not found");
            }
            order.addOrderedGame(game);
        }

        return customerOrderRepository.save(order);
}}
